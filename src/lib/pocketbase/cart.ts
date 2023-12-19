import { error } from '@sveltejs/kit'
import { get } from 'svelte/store'
import { currentUser, pb } from './pb'
import type { LineItemResponse } from './pocketbase-types'

export async function getCartItems<T extends LineItemResponse = LineItemResponse>(expand?: string) {
  const user = get(currentUser)
  if(!user) throw error(401, {message: "You must be logged in to perform this action"})
  return pb
    .collection('line_item')
    .getList<T>(0, 50, { filter: `user='${user.id}'`, expand })
}