import { pb } from '$lib/pocketbase/pb.js'
import type {
  GameResponse,
  PlayerResponse,
  TeamGroupResponse,
  TeamResponse,
} from '$lib/pocketbase/pocketbase-types.js'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
  try {
    const team = await pb.collection('team').getFirstListItem<
      TeamResponse<{
        live_game: GameResponse<{ team: TeamResponse }>
        'player(team)': PlayerResponse[]
        'team_group(team)': TeamGroupResponse[]
        'game(team)': GameResponse[]
      }>
    >(pb.filter('slug={:slug}', { slug: params.teamSlug }), {
      expand: 'live_game.team,player(team),team_group(team),game(team)',
    })
    return {
      team,
    }
  } catch (e) {
    console.error(e)
    throw error(404, { message: 'Team not found' })
  }
}
