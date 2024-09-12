import { ShippingAddressSchema } from '$lib/schemas/shipping'
import { z } from 'zod'

export const CalculateShipmentSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  weightInOz: z.number().nonnegative(),
})

export interface CalculatedShipmentSchema {
  cheapestShipmentInCents: number
  shipmentId: string
}
