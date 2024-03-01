import { pb } from '$lib/pocketbase/pb.js'
import type {
  GameResponse,
  TeamResponse,
} from '$lib/pocketbase/pocketbase-types.js'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
  const filter = pb.filter('slug={:teamSlug}', { teamSlug: params.teamSlug })
  try {
    const team = pb
      .collection('team')
      .getFirstListItem<TeamResponse<{ 'game(team)': GameResponse[] }>>(
        filter,
        {
          expand: 'game(team)',
        },
      )
    return { team }
  } catch (e) {
    console.error(e)
    throw error(404, { message: 'Team not found' })
  }
}
