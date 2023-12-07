import { currentUser, pb } from '$lib/pocketbase/pb'

pb.authStore.loadFromCookie(document.cookie)
pb.authStore.onChange(() => {
  currentUser.set(pb.authStore.model as any)
  document.cookie = pb.authStore.exportToCookie({ httpOnly: false })
})
