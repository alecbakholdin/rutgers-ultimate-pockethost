import { pb } from '$lib/pocketbase/pb'
import {
  GamePointEventTypeOptions,
  GamePointTypeOptions,
  type GamePointEventResponse,
  type GamePointResponse,
  type GameResponse,
  type PlayerResponse,
  type TeamGroupResponse,
  type TeamResponse,
} from '$lib/pocketbase/pocketbase-types'
import _ from 'lodash'
import { getContext, onMount, setContext } from 'svelte'
import {
  derived,
  get,
  writable,
  type Readable,
  type Unsubscriber,
} from 'svelte/store'

export type LiveFeedGamePointEvent = GamePointEventResponse<{
  player: PlayerResponse
}>
export type LiveFeedGamePoint = GamePointResponse<{
  'game_point_event(game_point)': LiveFeedGamePointEvent[]
  starting_line: PlayerResponse[]
  goal: PlayerResponse
  assist: PlayerResponse
}>
const expansionString =
  'goal,assist,game_point_event(game_point).player,starting_line'

export async function getPointsForGame(gameId: string) {
  return pb.collection('game_point').getFullList<LiveFeedGamePoint>({
    filter: pb.filter('game={:gameId}', { gameId }),
    expand: expansionString,
    sort: '-created',
  })
}

export async function getPoint(id: string) {
  return pb
    .collection('game_point')
    .getOne<LiveFeedGamePoint>(id, { expand: expansionString })
}

export async function getPointEvent(id: string) {
  return pb
    .collection('game_point_event')
    .getOne<LiveFeedGamePointEvent>(id, { expand: 'player' })
}

type GameWithTeam = GameResponse<{ team: TeamResponse }>
type TeamWithGame = TeamResponse<{
  live_game: GameResponse<{ team: TeamResponse }>
  'player(team)': PlayerResponse[]
  'team_group(team)': TeamGroupResponse[]
}>
export type LiveGameContext = {
  team: Readable<TeamWithGame | undefined>
  players: Readable<PlayerResponse[]>
  game: Readable<GameWithTeam | undefined>
  gamePoints: Readable<LiveFeedGamePoint[]>
  gameOver: Readable<boolean>
  ourPossession: Readable<boolean>
}
export function getLiveGameContext(): LiveGameContext {
  return getContext('liveGame')
}
export function initLiveGameContext(
  team: TeamWithGame,
  game?: GameResponse<{ team: TeamResponse }>,
) {
  const teamStore = writable<TeamWithGame | undefined>(team)
  const gameStore = derived(
    teamStore,
    ($team) => game ?? $team?.expand?.live_game,
  )
  const gamePointsStore = writable<LiveFeedGamePoint[]>()
  async function updateTeamStore() {
    teamStore.set(
      await pb.collection('team').getOne<TeamWithGame>(team.id, {
        expand: 'live_game.team,player(team),team_group(team)',
      }),
    )
  }

  async function updatePointEvent(id: string) {
    try {
      const newVal = await getPoint(id)
      if (newVal.game !== get(gameStore)?.id) return
      gamePointsStore.update((pe) => {
        pe = pe.filter((x) => x.id !== id)
        pe.push(newVal)
        return _.sortBy(pe, 'created').reverse()
      })
    } catch (e) {
      console.error(e)
    }
  }

  onMount(() => {
    const teamUnsub = pb
      .collection('team')
      .subscribe(team.id, async (e) =>
        e.action === 'update' ? updateTeamStore() : teamStore.set(undefined),
      )
    const groupUnsub = pb
      .collection('team_group')
      .subscribe(
        '*',
        async (e) => e.record.team === get(teamStore)?.id && updateTeamStore(),
      )
    const playerUnsub = pb
      .collection('player')
      .subscribe(
        '*',
        async (e) => e.record.team === get(teamStore)?.id && updateTeamStore(),
      )
    const gameUnsub = pb
      .collection('game')
      .subscribe(
        '*',
        async (e) => e.record.id === get(gameStore)?.id && updateTeamStore(),
      )
    const gamePointsUnsub = pb
      .collection('game_point')
      .subscribe('*', async (e) => {
        if (e.record.game !== get(gameStore)?.id) return
        if (e.action === 'delete') {
          gamePointsStore.update((pe) => pe.filter((x) => x.id !== e.record.id))
          return
        }
        await updatePointEvent(e.record.id)
      })
    const gamePointEventsUnsub = pb
      .collection('game_point_event')
      .subscribe('*', async (e) => updatePointEvent(e.record.game_point))
    const gameStoreUnsub = gameStore.subscribe(async (game) =>
      gamePointsStore.set(game ? await getPointsForGame(game.id) : []),
    )
    const gsuPromise = new Promise<Unsubscriber>((res) => res(gameStoreUnsub))
    return () =>
      [
        teamUnsub,
        groupUnsub,
        playerUnsub,
        gameUnsub,
        gamePointsUnsub,
        gamePointEventsUnsub,
        gsuPromise,
      ].forEach((x) => x.then((f) => f()))
  })

  const context = {
    team: teamStore,
    game: gameStore,
    players: derived(
      teamStore,
      ($team) => $team?.expand?.['player(team)'] || [],
    ),
    gamePoints: gamePointsStore,
    gameOver: derived(gamePointsStore, ($gp) =>
      Boolean($gp?.length && $gp[0].type === GamePointTypeOptions.Final),
    ),
    ourPossession: derived(gamePointsStore, ($gp) => {
      const livePoint = $gp?.find(
        (x) =>
          !x.opponent_goal && !x.goal && x.type !== GamePointTypeOptions.Final,
      )

      const startedWithPossession = livePoint?.type === GamePointTypeOptions.O
      const numberOfTurns =
        livePoint?.expand?.['game_point_event(game_point)']?.filter(
          (x) =>
            x.type === GamePointEventTypeOptions.Turn ||
            x.type === GamePointEventTypeOptions.Drop ||
            x.type === GamePointEventTypeOptions.Block,
        ).length || 0
      return Boolean(
        (startedWithPossession && !(numberOfTurns % 2)) ||
          (!startedWithPossession && numberOfTurns % 2),
      )
    }),
  } satisfies LiveGameContext
  setContext('liveGame', context)
  return context
}
