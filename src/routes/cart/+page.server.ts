import { getCartItems } from '$lib/pocketbase/cart.js'
import type {
  LineItemResponse,
  ProductRecord,
  ProductResponse,
} from '$lib/pocketbase/pocketbase-types'
import { fail, error, redirect } from '@sveltejs/kit'
import { stripe } from '$lib/stripe/stripe'
import { superValidate } from 'sveltekit-superforms/server'
import { CreateCheckoutSchema } from './schemas'
import type { z } from 'zod'
import type {
  CalculateShipmentSchema,
  CalculatedShipmentSchema,
} from '../api/shipment/calculate/schemas'
import type { IRate } from '@easypost/api'
import type {
  OrderLineItemRecord,
  OrderRecord,
} from '$lib/pocketbase/pocketbase-types'
import jwt from 'jsonwebtoken'
import type { CompleteCheckoutType } from '$lib/schemas/completeCheckout'
import { SERVER_SECRET } from '$env/static/private'
import type { ShippingAddressSchema } from '$lib/schemas/shipping'
import type Stripe from 'stripe'

export async function load() {
  return {
    cart: await getCartItems<LineItemResponse<any, { product: ProductRecord }>>(
      'product',
    ),
    createCheckoutForm: await superValidate(CreateCheckoutSchema),
  }
}

export const actions = {
  async default({ request, locals: { pb, user }, url, fetch }) {
    const form = await superValidate(request, CreateCheckoutSchema)
    if (!form.valid) return fail(400, { form })

    const cartItems =
      await getCartItems<LineItemResponse<any, { product: ProductResponse }>>(
        'product',
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
        } satisfies z.infer<typeof CalculateShipmentSchema>),
      })
      if (response.status === 200) {
        const { cheapestShipmentInCents } =
          (await response.json()) as CalculatedShipmentSchema
        shippingCostInCents = cheapestShipmentInCents
      }
    }

    const orderLineItems: OrderLineItemRecord<Record<string, string>>[] =
      cartItems.items.map((item) => {
        const unitPriceCents = item.expand!.product.priceInCents
        return {
          order: '',
          quantity: item.quantity,
          product: item.product,
          fields: item.fields,
          unitPriceCents,
          totalCents: unitPriceCents * item.quantity,
        }
      })
    const subtotal = orderLineItems.reduce(
      (prev, item) => prev + item.totalCents!,
      0,
    )
    const order: OrderRecord<z.infer<typeof ShippingAddressSchema>> = {
      user: user.id,
      shippingAddress: form.data.shippingAddress,
      subtotal,
      shippingCostInCents,
      total: subtotal + (shippingCostInCents ?? 0),
    }
    const token = jwt.sign(
      { order, lineItems: orderLineItems } satisfies CompleteCheckoutType,
      SERVER_SECRET,
    )

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
            metadata: item.fields,
          },
          unit_amount: item.expand!.product.priceInCents,
        },
        quantity: item.quantity,
      }))
    if(shippingCostInCents !== undefined) {
        line_items.push({
            price_data: {
                currency: 'USD',
                product_data: {
                    name: 'Shipping',
                    images: [
                        'https://api.iconify.design/material-symbols/local-shipping.svg?color=white&width=80&height=80'
                    ],
                    description: 'Shipping Cost'
                },
                unit_amount: shippingCostInCents,
            },
            quantity: 1
        })
    }
    const response = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${url.origin}/checkout/success?c=${token}`,
    })
    if (response.url) {
      throw redirect(308, response.url)
    }
  },
}
