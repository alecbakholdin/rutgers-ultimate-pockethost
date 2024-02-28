import { pb } from '$lib/pocketbase/pb.js'
import type {
  GameResponse,
  PlayerResponse,
  TeamResponse,
} from '$lib/pocketbase/pocketbase-types.js'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
  try {
    const team = await pb
      .collection('team')
      .getFirstListItem<TeamResponse<{ live_game: GameResponse<{team: TeamResponse}>, 'player(team)': PlayerResponse[] }>>(
        pb.filter('slug={:slug}', { slug: params.teamSlug }),
        { expand: 'live_game.team,player(team)' },
      )
    return {
      team
    }
  } catch (e) {
    console.error(e)
    throw error(404, { message: 'Team not found' })
  }
}
