import type {
  TeamResponse,
  GameResponse,
} from '$lib/pocketbase/pocketbase-types'

export async function load({ url, locals: { user, pb } }) {
  const liveTeams = await pb
    .collection('team')
    .getFullList<TeamResponse<{ live_game: GameResponse }>>({
      filter: 'live_game != null',
      expand: 'live_game',
    })

  return {
    liveTeams: liveTeams.filter(
      (team) => url.pathname.split('/').filter((x) => x)[0] !== team.slug,
    ),
    user,
  }
}
