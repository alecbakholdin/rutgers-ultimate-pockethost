import { states } from '$lib/util/data/states'
import { z } from 'zod'

export const ShippingAddressSchema = z.object({
  city: z.string(),
  line1: z.string(),
  line2: z.string(),
  postal_code: z.string(),
  state: z.enum(states),
})
