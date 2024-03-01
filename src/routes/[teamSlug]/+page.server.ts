import { error, type Actions } from '@sveltejs/kit'

export const actions: Actions = {
  async createGame({ request }) {
    const formData = (await request.formData())
    const data = formData.
  },
}
