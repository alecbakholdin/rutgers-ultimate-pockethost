export interface StatsRow {
  playerId: string
  playerName: string

  pointsPlayed: number
  goals: number
  assists: number
  blocks: number
  turns: number
  drops: number

  plusMinus: number
  plusMinusPerPoint: number
  oPoints: number
  dPoints: number
  oConversions: number
  dConversions: number
  oConversionPct: number
  dConversionPct: number

  oTurns: number
  dTurns: number

  pointsPlayedPct: number
  oPointsPct: number
  dPointsPct: number
}

export interface StatsQuery {
  teamSlug: string
  gameIds: string[]
  playerIds: string[]
  startDate: string
  endDate: string
}
