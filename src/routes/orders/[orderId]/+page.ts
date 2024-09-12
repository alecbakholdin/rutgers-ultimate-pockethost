import {
  type FullOrderResponse,
  fullOrderResponseExpansionString,
} from '$lib/pocketbase/derived-pocketbase-types.js'
import { pb } from '$lib/pocketbase/pb'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
  try {
    const order = await pb
      .collection('order')
      .getOne<FullOrderResponse>(params.orderId, {
        expand: fullOrderResponseExpansionString,
      })
    return { order }
  } catch (e) {
    console.error(e)
    error(404, 'Not found')
  }
}
