import { error } from '@sveltejs/kit'
import { get, writable } from 'svelte/store'
import { currentUser, pb } from './pb'
import type { LineItemResponse } from './pocketbase-types'

export async function getCartItems<
  T extends LineItemResponse = LineItemResponse,
>(expand?: string) {
  const user = get(currentUser)
  if (!user)
    throw error(401, {
      message: 'You must be logged in to perform this action',
    })
  return pb
    .collection('line_item')
    .getList<T>(0, 50, { filter: `user='${user.id}'`, expand })
}

export const cartItemCount = writable(0)
currentUser.subscribe(() => refreshCartItemCount())
export async function refreshCartItemCount() {
  const user = get(currentUser)
  if (!user) {
    cartItemCount.set(0)
    return
  }
  try {
    const cartSize = await pb.collection('cart_size').getOne(user.id, { requestKey: null });
    cartItemCount.set(cartSize.sumQuantity as number)
  } catch {
    cartItemCount.set(0);
  }
}
