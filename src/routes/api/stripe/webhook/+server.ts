import { dev } from '$app/environment'
import {
  POCKETBASE_ADMIN_EMAIL,
  POCKETBASE_ADMIN_PASSWORD,
  STRIPE_WEBHOOK_SIGNING_SECRET,
} from '$env/static/private'
import type {
  OrderLineItemRecordTyped,
  OrderRecordTyped,
} from '$lib/pocketbase/derived-pocketbase-types.js'
import type { TypedPocketBase } from '$lib/pocketbase/pocketbase-types.js'
import type {
  StripeLineItemMetadata,
  StripeOrderMetadata,
  StripeShippingMetadata,
} from '$lib/stripe/checkout.js'
import { stripe } from '$lib/stripe/stripe'
import { error, json } from '@sveltejs/kit'
import type { Stripe } from 'stripe'

const endpointSecret = STRIPE_WEBHOOK_SIGNING_SECRET

export async function POST({ request, locals: { pb } }) {
  console.log('POSTING RIGHT NOW')
  const admin = await pb.admins.authWithPassword(
    POCKETBASE_ADMIN_EMAIL,
    POCKETBASE_ADMIN_PASSWORD,
    { requestKey: null },
  )
  pb.authStore.save(admin.token, admin.admin)

  let event

  try {
    const sig = request.headers.get('stripe-signature')
    const body = await request.text()
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err) {
    console.error(err)
    throw error(400, { message: `Webhook error: ${(err as any).message}` })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object
      if (
        (checkoutSessionCompleted.metadata as StripeOrderMetadata)
          .isRutgersWebsiteOrder === 'true'
      ) {
        await createOrder(checkoutSessionCompleted, pb)
      }
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }
  return json({ message: 'ok' })
}

async function createOrder(
  checkout: Stripe.Checkout.Session,
  pb: TypedPocketBase,
) {
  const { userId } = checkout.metadata as StripeOrderMetadata
  const [order, lineItems, cartItems] = await Promise.all([
    createOrderObject(checkout),
    createOrderLineItems(checkout),
    pb.collection('line_item').getFullList({
      filter: `user='${userId}'`,
    }),
  ])

  const cartDeletion = Promise.all(
    cartItems.map(({ id }) =>
      pb.collection('line_item').delete(id, { requestKey: null }),
    ),
  )

  const { id: orderId } = await pb
    .collection('order')
    .create(order, { requestKey: null })
  await Promise.all(
    lineItems.map((lineItem) =>
      pb.collection('order_line_item').create(
        {
          ...lineItem,
          order: orderId,
        } satisfies OrderLineItemRecordTyped,
        { requestKey: null },
      ),
    ),
  )

  await cartDeletion
}

async function createOrderObject(checkout: Stripe.Checkout.Session) {
  const { shippingAddress, shippingCostInCents } = await getShipping(checkout)
  const { discountCode, userId } = checkout.metadata as StripeOrderMetadata
  return {
    user: userId,
    discountCode,
    shippingAddress,
    shippingCostInCents,
    totalInCents: checkout.amount_total ?? 0,
    subtotal: checkout.amount_subtotal ?? 0,
    testOrder: dev,
  } satisfies OrderRecordTyped
}

async function getShipping(checkout: Stripe.Checkout.Session) {
  const shippingOption = checkout.shipping_options?.[0]
  if (!shippingOption) return {}
  const rate = await stripe.shippingRates.retrieve(
    shippingOption.shipping_rate.toString(),
  )
  return {
    shippingCostInCents: shippingOption.shipping_amount,
    shippingAddress: rate.metadata as StripeShippingMetadata,
  }
}

async function createOrderLineItems(checkout: Stripe.Checkout.Session) {
  const stripeLineItems = await getStripeLineItems(checkout.id)
  const list: Omit<OrderLineItemRecordTyped, 'order'>[] = []
  for (const stripeLineItem of stripeLineItems) {
    if (!stripeLineItem.price) continue
    const product = await stripe.products.retrieve(
      stripeLineItem.price.product.toString(),
    )
    const { _productId, ...fields } = product.metadata as StripeLineItemMetadata
    const quantity = stripeLineItem.quantity ?? 1
    const unitPriceCents = stripeLineItem.price.unit_amount ?? 0
    list.push({
      product: _productId,
      quantity,
      fields,
      totalCents: unitPriceCents * quantity,
      unitPriceCents,
    })
  }
  return list
}

async function getStripeLineItems(id: string) {
  const list: Stripe.LineItem[] = []
  let resp
  do {
    resp = await stripe.checkout.sessions.listLineItems(id, {
      starting_after: list.slice(-1)?.[0]?.id,
      limit: 100,
    })
    list.push(...resp.data)
  } while (resp.has_more)
  return list
}
