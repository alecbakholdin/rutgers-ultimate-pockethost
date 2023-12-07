import { SERVER_SECRET } from '$env/static/private'
import { getCartItems } from '$lib/pocketbase/cart.js'
import type { CompleteCheckoutType } from '$lib/schemas/completeCheckout.js'
import { redirect } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'

export async function load({ locals: { pb }, url }) {
  const token = url.searchParams.get('c')
  if (token) {
    const cart = await getCartItems()
    const payload = jwt.verify(token, SERVER_SECRET) as CompleteCheckoutType
    for (const item of cart.items) {
      await pb.collection('line_item').delete(item.id)
    }
    const order = await pb.collection('order').create(payload.order)
    for (const item of payload.lineItems) {
      await pb
        .collection('order_line_item')
        .create({ ...item, order: order.id })
    }
    throw redirect(303, url.pathname)
  }
}
