import { redirect } from '@sveltejs/kit'

export async function load({ parent, params }) {
  const { team } = await parent()
  if (!team?.live_game) throw redirect(303, `/${params.teamSlug}`)
}
