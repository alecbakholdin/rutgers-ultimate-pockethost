import { getCartItems } from '$lib/pocketbase/cart.js'
import {
  lineItemExpansionString,
  type ExpandedLineItem,
} from '$lib/pocketbase/derived-pocketbase-types'
import type {
  StripeLineItemMetadata,
  StripeOrderMetadata,
  StripeShippingMetadata,
} from '$lib/stripe/checkout'
import { stripe } from '$lib/stripe/stripe'
import {
  getCartTotal,
  getCartWeight,
  getLineItemPrice,
  getUnitPriceWithFields,
  validDiscount,
} from '$lib/util/functions/cartUtils'
import { error, fail, redirect } from '@sveltejs/kit'
import type Stripe from 'stripe'
import { superValidate } from 'sveltekit-superforms/server'
import type { z } from 'zod'
import type {
  CalculateShipmentSchema,
  CalculatedShipmentSchema,
} from '../api/shipment/calculate/schemas'
import { CreateCheckoutSchema } from './schemas'
import _ from 'lodash'

export async function load() {
  return {
    cart: await getCartItems<ExpandedLineItem>(lineItemExpansionString),
    createCheckoutForm: await superValidate(CreateCheckoutSchema),
  }
}

export const actions = {
  async default({ request, locals: { pb, user }, url, fetch }) {
    const form = await superValidate(request, CreateCheckoutSchema)
    if (!form.valid) return fail(400, { form })

    const cartItems = await getCartItems<ExpandedLineItem>(
      lineItemExpansionString,
    )
    if (cartItems.items.length === 0) {
      throw error(400, { message: 'No items included' })
    }

    const { shippingAddress } = form.data
    let shippingCostInCents: number | undefined
    if (shippingAddress) {
      const response = await fetch('/api/shipment/calculate', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress,
          weightInOz: getCartWeight(cartItems.items),
        } satisfies z.infer<typeof CalculateShipmentSchema>),
      })
      if (response.status === 200) {
        const { cheapestShipmentInCents } =
          (await response.json()) as CalculatedShipmentSchema
        shippingCostInCents = cheapestShipmentInCents
      }
    }

    if (form.data.discountCode) {
      const response = await fetch(
        `/api/teamDiscount?code=${form.data.discountCode}`,
      )
      validDiscount.set(response.status === 200)
    }

    const totalInCents = getCartTotal(cartItems.items)
    const processingFee = 0.022 * totalInCents + 0.3
    const profitInCents =
      totalInCents - getCartTotal(cartItems.items, true) - processingFee

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cartItems.items.map((item) => ({
        price_data: {
          currency: 'USD',
          product_data: {
            name: item.expand!.product.title,
            images: [
              pb.getFileUrl(
                item.expand!.product,
                item.expand!.product.primaryImage,
              ),
            ],
            metadata: {
              _productId: item.product,
              _profitInCents: Math.floor(
                (profitInCents * getLineItemPrice(item)) / totalInCents,
              ).toFixed(0),
              ...(item.fields && item.fields),
            } satisfies StripeLineItemMetadata,
          },
          unit_amount: getUnitPriceWithFields(
            item.expand?.product,
            item.fields,
          ),
        },
        quantity: item.quantity,
      }))

    const total =
      _.sumBy(
        line_items,
        (item) => (item.quantity ?? 0) * (item.price_data?.unit_amount ?? 0),
      ) + (shippingCostInCents ?? 0)

    const response = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items,
      payment_intent_data: {
        description: 'R Ultimate Merchandise'
      },
      success_url: `${url.origin}/checkout/success`,
      ...(shippingCostInCents !== undefined &&
        shippingAddress && {
          shipping_options: [
            {
              shipping_rate_data: {
                display_name: 'Shipped Once Ready',
                type: 'fixed_amount',
                fixed_amount: {
                  amount: shippingCostInCents,
                  currency: 'USD',
                },
                metadata: shippingAddress satisfies StripeShippingMetadata,
              },
            },
          ],
        }),
      metadata: {
        isRutgersWebsiteOrder: 'true',
        profitInCents: profitInCents.toFixed(0),
        userId: user.id,
        ...(validDiscount &&
          form.data.discountCode && {
            discountCode: form.data.discountCode,
          }),
      } satisfies StripeOrderMetadata,
    })
    if (response.url) {
      throw redirect(308, response.url)
    }
  },
}
