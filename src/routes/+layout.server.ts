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
      (team) => `/${team.slug}/live` !== url.pathname,
    ),
    user
  }
}
