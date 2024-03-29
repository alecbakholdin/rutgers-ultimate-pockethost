import { pb } from '$lib/pocketbase/pb.js'
import type {
  GameResponse,
  TeamResponse,
} from '$lib/pocketbase/pocketbase-types'
import { error } from '@sveltejs/kit'

export async function load({ params: { gameId } }) {
  try {
    const game = await pb
      .collection('game')
      .getOne<GameResponse<{ team: TeamResponse }>>(gameId, { expand: 'team' })
    return {
      game,
    }
  } catch (e) {
    console.error(e)
    throw error(404, { message: 'Game not found' })
  }
}
