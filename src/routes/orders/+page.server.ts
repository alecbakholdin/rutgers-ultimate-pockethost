import type {
  OrderLineItemResponse,
  OrderResponse,
  ProductResponse,
} from '$lib/pocketbase/pocketbase-types'
import type { ShippingAddressSchema } from '$lib/schemas/shipping.js'
import type { z } from 'zod'

export async function load({ locals: { pb, user } }) {
  return {
    orders: await pb.collection('order').getList<
      OrderResponse<
        z.infer<typeof ShippingAddressSchema>,
        {
          'order_line_item(order)': OrderLineItemResponse<
            Record<string, string>,
            { product: ProductResponse }
          >[]
        }
      >
    >(0, 5, {
      filter: `user='${user?.id ?? ''}'`,
      expand: 'order_line_item(order).product',
      sort: '-created'
    }),
  }
}
