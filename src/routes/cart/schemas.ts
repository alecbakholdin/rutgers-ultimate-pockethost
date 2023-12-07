import { ShippingAddressSchema } from '$lib/schemas/shipping'
import { z } from 'zod'

export const CreateCheckoutSchema = z.object({
  discountCode: z.string().optional(),
  shippingAddress: ShippingAddressSchema.optional(),
})
