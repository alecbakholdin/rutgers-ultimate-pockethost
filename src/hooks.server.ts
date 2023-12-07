import { currentUser, pb } from '$lib/pocketbase/pb'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  // before
  pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '')
  if (pb.authStore.isValid) {
    try {
      await pb.collection('users').authRefresh({requestKey: null})
    } catch (e) {
      pb.authStore.clear()
    }
  }

  event.locals.pb = pb
  event.locals.user = structuredClone(pb.authStore.model) as any
  currentUser.set(event.locals.user);

  const response = await resolve(event)

  // after
  response.headers.set(
    'set-cookie',
    pb.authStore.exportToCookie({ httpOnly: false, maxAge: 365*24*60*60, sameSite: 'Lax'})
  )

  return response
}
