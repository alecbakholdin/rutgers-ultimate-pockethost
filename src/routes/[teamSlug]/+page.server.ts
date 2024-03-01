import type { GameRecord } from '$lib/pocketbase/pocketbase-types';
import { error, type Actions } from '@sveltejs/kit'

export const actions: Actions = {
  async createGame({ request, locals: {pb} }) {
    const formData = (await request.formData())
    const team = formData.get('team')?.toString();
    const opponent = formData.get('opponent')?.toString();
    const date = formData.get("start_date")?.toString();
    const time = formData.get("start_time")?.toString();
    if(!team) {
      throw error(400, {message: "Team is required"});
    } else if(!opponent) {
      throw error(400, {message: "Opponent is required"});
    } else if(!date || !time) {
      throw error(400, {message: "Date and time are both required"});
    }
    const startDateTimeStr = `${date} ${time}Z`;
    
    await pb.collection('game').create({
      team,
      opponent,
      start: startDateTimeStr
    } satisfies GameRecord)
  },
  async setLiveGame({request, locals: {pb}}) {
    const form = await request.formData();
    const teamId = form.get('team')?.toString();
    const gameId = form.get('game')?.toString();

    if(!teamId || !gameId) {
      throw error(400, {message: 'Team or game not set'});
    }
  }
}
