import { currentUser } from '$lib/pocketbase/pb.js'
import type {
  OrderLineItemResponse,
  OrderResponse,
} from '$lib/pocketbase/pocketbase-types'
import { stripe } from '$lib/stripe/stripe.js'
import { error, json } from '@sveltejs/kit'
import { get } from 'svelte/store'

export async function POST({
  locals: { pb },
  params: { orderLineItemId },
}) {
  const user = get(currentUser)
  if (!user) {
    throw error(401, { message: 'Not authenticated' })
  } else if (!user.isManager) {
    throw error(403, { message: 'You do not have permissions to do this' })
  } else if (!orderLineItemId) {
    throw error(400, { message: 'orderLineItemId is empty' })
  }

  const lineItem = (await pb
    .collection('order_line_item')
    .getOne(orderLineItemId, { expand: 'order' })) as OrderLineItemResponse<
    any,
    { order: OrderResponse }
  >
  if (lineItem.refunded) {
    console.error('line item has already been refunded')
    throw error(400, { message: 'line item has already been refunded' })
  } else if (lineItem.totalCents <= 0) {
    throw error(400, { message: 'line item must have non-zero total' })
  }

  const paymentId = lineItem.expand?.order.stripePaymentId
  if (!paymentId) {
    throw error(400, {
      message: "line item's order does not have a payment Id",
    })
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentId)
  const refund = await stripe.refunds.create(
    {
      payment_intent: paymentIntent.id,
      reason: 'requested_by_customer',
      amount: lineItem.totalCents,
    },
    {
      idempotencyKey: orderLineItemId + '-refund',
    },
  )

  await pb.collection('order_line_item').update(orderLineItemId, {refunded: true, refundId: refund.id})

  return json({ message: 'ok' })
}
