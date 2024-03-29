import { pb } from '$lib/pocketbase/pb'
import type {
  GameResponse,
  TeamResponse,
} from '$lib/pocketbase/pocketbase-types.js'

export async function load({ url }) {
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
  }
}
