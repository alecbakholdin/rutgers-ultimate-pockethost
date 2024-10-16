import type {
  GameRecord,
  PlayerRecord,
  TeamResponse,
  TypedPocketBase,
} from '$lib/pocketbase/pocketbase-types'
import { error, type Actions } from '@sveltejs/kit'
import { indexOf } from 'lodash'

export const actions: Actions = {
  async createGame({ request, locals: { pb } }) {
    const formData = await request.formData()
    const team = formData.get('team')?.toString()
    const opponent = formData.get('opponent')?.toString()
    const date = formData.get('start_date')?.toString()
    const time = formData.get('start_time')?.toString()
    if (!team) {
      throw error(400, { message: 'Team is required' })
    } else if (!opponent) {
      throw error(400, { message: 'Opponent is required' })
    } else if (!date || !time) {
      throw error(400, { message: 'Date and time are both required' })
    }

    await pb.collection('game').create({
      team,
      opponent,
      start: new Date(`${date} ${time}`),
    } satisfies GameRecord | { start: Date })
  },
  async createPlayer({ request, locals: { pb } }) {
    const formData = await request.formData()
    const team = formData.get('teamId')?.toString()
    const name = formData.get('name')?.toString()
    if (!team || !name) {
      console.error('teamId:', team, 'name:', name)
      throw error(400, 'Missing data')
    }
    await pb.collection('player').create({
      name,
      team,
    } satisfies PlayerRecord)
  },
  async editGame({ request, locals: { pb } }) {
    const form = await request.formData()
    const gameId = form.get('gameId')?.toString()
    if (!gameId) throw error(400, { message: 'Missing gameId' })
    const opponent = form.get('opponent')?.toString()
    const start = form.get('start')?.toString()
    const half_cap_min =
      parseInt(form.get('half_cap_min')?.toString() ?? '') || 0
    const soft_cap_min =
      parseInt(form.get('soft_cap_min')?.toString() ?? '') || 0
    const hard_cap_min =
      parseInt(form.get('hard_cap_min')?.toString() ?? '') || 0

    await pb.collection('game').update(gameId, {
      opponent,
      start: start && new Date(start),
      half_cap_min,
      soft_cap_min,
      hard_cap_min,
    } as Partial<GameRecord & { start: Date }>)
  },
  async setLive({ request, locals: { pb }, params }) {
    const form = await request.formData()
    const gameId = form.get('gameId')?.toString()
    if (!gameId) throw error(400, { message: 'Missing gameId' })
    const team = await getTeam(pb, params.teamSlug!)
    await pb
      .collection('team')
      .update(team.id, { live_game: gameId } as Partial<TeamResponse>)
  },
  async removeFromLive({ locals: { pb }, params }) {
    const team = await getTeam(pb, params.teamSlug!)
    await pb.collection('team').update(team.id, { live_game: '' })
  },
}

async function getTeam(
  pb: TypedPocketBase,
  slug: string,
): Promise<TeamResponse> {
  return pb
    .collection('team')
    .getFirstListItem(pb.filter('slug = {:slug}', { slug }))
}
