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
}

export interface StatsQuery {
  teamSlug: string
  gameIds: string[]
  playerIds: string[]
  startDate: string
  endDate: string
}
