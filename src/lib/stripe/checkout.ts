import type { ShippingAddressSchema } from '$lib/schemas/shipping'
import type { z } from 'zod'

export type StripeLineItemMetadata = { _productId: string, _profitInCents: string } & Record<
  string,
  string
>

export type StripeOrderMetadata = {
  isRutgersWebsiteOrder: "true"
  profitInCents: string
  userId: string
  discountCode?: string
}

export type StripeShippingMetadata = z.infer<typeof ShippingAddressSchema>
