import type { ShippingAddressSchema } from '$lib/schemas/shipping'
import type { z } from 'zod'

export type StripeLineItemMetadata =
  | ({ _productId: string } & Record<string, string>)

export type StripeOrderMetadata = {
  userId: string
  discountCode?: string
}

export type StripeShippingMetadata = z.infer<typeof ShippingAddressSchema>
