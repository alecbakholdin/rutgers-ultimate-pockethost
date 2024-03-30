<script lang="ts">
  import {
    GamePointEventTypeOptions,
    GamePointTypeOptions,
    type GameResponse,
    type TeamResponse,
  } from '$lib/pocketbase/pocketbase-types'
  import _ from 'lodash'
  import type { LiveFeedGamePoint } from './gamePointType'
  import { formatDate } from '$lib/util/functions/formatDate'
  import { pb } from '$lib/pocketbase/pb'

  export let game: GameResponse
  export let team: TeamResponse
  export let gamePoints: LiveFeedGamePoint[] | undefined = undefined

  export let size: 'sm' | 'lg' = 'lg'

  $: isLive = team?.live_game === game?.id && !game?.end
  $: isFinal = Boolean(game?.end)

  $: teamLogo = team.logo ? pb.getFileUrl(team, team.logo) : '/smiley.png'
  $: opponentLogo = '/opponent.png'

  $: gamePointEvents =
    gamePoints?.flatMap((x) => x.expand?.['game_point_event(game_point)']) ?? []
  $: opponentBreaks =
    gamePoints?.filter(
      (x) => x.type === GamePointTypeOptions.O && x.opponent_goal,
    ).length ?? 0
  $: teamBreaks =
    gamePoints?.filter((x) => x.type === GamePointTypeOptions.D && x.goal)
      .length ?? 0
  $: turns = (opponent?: boolean) =>
    gamePointEvents.filter(
      (x) =>
        x &&
        (([
          GamePointEventTypeOptions.Turn,
          GamePointEventTypeOptions.Drop
        ].includes(x.type) &&
        !!opponent === !!x.opponent)||(x.type === GamePointEventTypeOptions.Block && !!opponent === !x.opponent)) ,
    )
</script>

<div class="card rounded-md card-compact card-bordered max-w-sm w-full">
  <div class="card-body !p-0">
    <div class="p-2 border-b w-full grid grid-cols-[1fr_3fr_1fr]">
      <div
        class="w-fit rounded bg-opacity-30 flex items-center gap-1 text-xs py-1 px-2"
        class:bg-red-400={isLive}
        class:text-red-400={isLive}
        class:bg-gray-400={!isLive}
        class:text-neutral={!isLive}
      >
        {#if isLive}
          <div
            class="rounded-full w-2 h-2 bg-red-400 mt-[2px] animate-pulse"
          ></div>
        {/if}
        <span>{isLive ? 'Live' : isFinal ? 'Final' : 'Scheduled'}</span>
      </div>
      <span class="text-gray-500 text-center">
        {game?.start && formatDate(game.start)}
      </span>
      {#if size !== 'sm'}
        <a
          data-sveltekit-preload-data="off"
          href="/machine/statistics?game={game?.id}"
          class="text-right text-gray-500"
        >
          Stats
        </a>
      {/if}
    </div>
  </div>
  <div class="p-2 grid grid-cols-[1fr_auto_1fr] place-items-center">
    <div class="flex flex-col items-center">
      <img
        class="object-contain w-20 h-20"
        class:hidden={size === 'sm'}
        src={teamLogo}
        alt={team.name}
      />
      <span class="text-center font-semibold">{team.name}</span>
    </div>
    <div class="flex flex-col items-center">
      <div class="grid gap-2 grid-cols-[1fr_auto_1fr] font-bold py-4">
        <span class="text-4xl text-success text-right">{game?.team_score}</span>
        <span class="text-2xl text-gray-400 mt-1 text-center">:</span>
        <span class="text-4xl text-error text-left">{game?.opponent_score}</span
        >
      </div>
      {#if gamePoints}
        <div class="grid gap-x-1 grid-cols-[1fr_auto_1fr]">
          <span class="text-success text-right">{teamBreaks}</span>
          <span class="text-gray-400 text-center">Breaks</span>
          <span class="text-error text-left">{opponentBreaks}</span>
          <span class="text-success text-right">{turns(false).length}</span>
          <span class="text-gray-400 text-center">Turns</span>
          <span class="text-error text-left">{turns(true).length}</span>
        </div>
      {/if}
    </div>
    <div class="flex flex-col items-center">
      <img
        class="object-contain w-20 h-20"
        class:hidden={size === 'sm'}
        src={opponentLogo}
        alt={game?.opponent}
      />
      <span class="text-center font-semibold">{game?.opponent}</span>
    </div>
  </div>
</div>
