import { json } from '@sveltejs/kit'
import {
  GamePointRecord,
  GamePointEventRecord,
  GameRecord,
  TypedPocketBase,
  PlayerRecord,
  GamePointEventTypeOptions,
  GamePointTypeOptions,
} from '$lib/pocketbase/pocketbase-types.js'
import type { StatsQuery, StatsRow } from './data'
import type { RouteParams } from './$types'
import _ from 'lodash'

export async function GET({ url, params, locals: { pb } }) {
  const query = getParams(url, params)
  const [players, points, pointEvents] = await Promise.all([
    getPlayers(query, pb),
    getPoints(query, pb),
    getPointEvents(query, pb),
  ])

  const pointsPlayedDict = _.countBy(
    points.flatMap((p) => [...p.starting_line, ...p.subs]),
  )
  const goalDict = _.countBy(points, (p) => p.goal)
  const assistDict = _.countBy(points, (p) => p.assist)
  const blockDict = _.countBy(
    pointEvents.filter((p) => p.type === GamePointEventTypeOptions.Block),
    (p) => p.player,
  )
  const turnDict = _.countBy(
    pointEvents.filter((p) => p.type === GamePointEventTypeOptions.Turn),
    (p) => p.player,
  )
  const dropDict = _.countBy(
    pointEvents.filter((p) => p.type === GamePointEventTypeOptions.Drop),
    (p) => p.player,
  )

  const oPointsDict = _.countBy(
    points.filter(p => p.type === GamePointTypeOptions.O).flatMap((p) => [...p.starting_line, ...p.subs]),
  )
  const dPointsDict = _.countBy(
    points.filter(p => p.type === GamePointTypeOptions.D).flatMap((p) => [...p.starting_line, ...p.subs]),
  )


  const stats = players.map((player) => {
    const pointsPlayed = pointsPlayedDict[player.id] ?? 0
    const goals = goalDict[player.id] ?? 0
    const assists = assistDict[player.id] ?? 0
    const blocks = blockDict[player.id] ?? 0
    const turns = turnDict[player.id] ?? 0
    const drops = dropDict[player.id] ?? 0
    const plusMinus = goals + assists + blocks - turns - drops
    const oPoints = oPointsDict[player.id] ?? 0;
    const dPoints = dPointsDict[player.id] ?? 0;
    return {
      playerId: player.id,
      playerName: player.name,

      pointsPlayed,
      goals,
      assists,
      blocks,
      turns,
      drops,
      plusMinus,
      plusMinusPerPoint: plusMinus / pointsPlayed,
      oPoints,
      dPoints
    } satisfies StatsRow
  })

  return json(_.orderBy(stats, ['pointsPlayed'], ['desc']))
}

async function getPlayers(query: StatsQuery, pb: TypedPocketBase) {
  return pb.collection('player').getFullList({
    filter: pb.filter(
      combine(
        oneOfFilter(pb, 'id', '=', query.playerIds),
        'team.slug = {:teamSlug}',
      ),
      query,
    ),
  })
}

async function getPointEvents(query: StatsQuery, pb: TypedPocketBase) {
  type T = GamePointEventRecord
  const filter = combine(
    pb.filter('game_point.game.team.slug = {:teamSlug}', query),
    oneOfFilter<T>(pb, 'player', '~', query.playerIds),
    oneOfFilter(pb, 'game_point.game', '=', query.gameIds),
    query.startDate &&
      pb.filter('created >= {:start}', { start: query.startDate + ' 00:00' }),
    query.endDate &&
      pb.filter('created <= {:end}', { end: query.endDate + ' 23:59' }),
  )
  console.log(filter)
  return pb.collection('game_point_event').getFullList({
    filter,
  })
}

async function getPoints(query: StatsQuery, pb: TypedPocketBase) {
  type T = GamePointRecord
  const filter = combine(
    pb.filter('game.team.slug = {:teamSlug}', query),
    combine(
      oneOfFilter<T>(pb, 'starting_line', '~', query.playerIds),
      oneOfFilter<T>(pb, 'subs', '~', query.playerIds),
    ),
    oneOfFilter<T>(pb, 'game', '=', query.gameIds),
    query.startDate &&
      pb.filter('created >= {:start}', { start: query.startDate + ' 00:00' }),
    query.endDate &&
      pb.filter('created <= {:end}', { end: query.endDate + ' 23:59' }),
  )
  console.log(filter)
  return pb.collection('game_point').getFullList({
    filter,
  })
}

function combine(...queries: string[]) {
  const validQueries = queries.filter((x) => x)
  if (!validQueries.length) {
    return ''
  } else if (validQueries.length === 1) {
    return validQueries[0]
  } else {
    return `(${validQueries.join(' && ')})`
  }
}

function oneOfFilter<T>(
  pb: TypedPocketBase,
  key: keyof T,
  op: '~' | '=',
  filterTerms: string[],
) {
  if (filterTerms.length === 0) return ''
  const filterStr = filterTerms
    .map((_, i) => `${String(key)} ${op} {:term${i}}`)
    .join(' || ')
  const params = Object.fromEntries(
    filterTerms.map((term, i) => [`term${i}`, term]),
  )
  return pb.filter(filterStr, params)
}

function getParams(url: URL, params: RouteParams): StatsQuery {
  const gameIds =
    url.searchParams
      .get('gameIds')
      ?.split(',')
      .map((x) => x.trim())
      .filter((x) => x) ?? []
  const playerIds =
    url.searchParams
      .get('playerIds')
      ?.split(',')
      .map((x) => x.trim())
      .filter((x) => x) ?? []

  return {
    teamSlug: params.teamSlug,
    gameIds,
    playerIds,
    startDate: url.searchParams.get('startDate') ?? '',
    endDate: url.searchParams.get('endDate') ?? '',
  }
}
