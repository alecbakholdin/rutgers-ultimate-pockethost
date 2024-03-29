import type { GameRecord, PlayerRecord } from '$lib/pocketbase/pocketbase-types'
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
}
