import { error, json } from '@sveltejs/kit'

export async function GET({ url, locals: { user, pb } }) {
  if (!user) throw error(401, { message: 'Unauthenticated' })

  const code = url.searchParams.get('code')
  if (!code)
    throw error(400, { message: "Missing query search parameter 'code'" })
  // throws 404 when nothing found
  await pb
    .collection('discount_codes')
    .getFirstListItem(pb.filter('code = {:code} && active = true', { code }))
  return json({ message: 'OK' })
}
