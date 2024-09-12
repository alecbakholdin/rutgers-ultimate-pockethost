import { easyPost } from '$lib/easyPost/easyPost'
import type { IShipmentCreateParameters } from '@easypost/api/types'
import { error, json } from '@sveltejs/kit'
import {
  CalculateShipmentSchema,
  type CalculatedShipmentSchema,
} from './schemas'

export async function POST({ request }) {
  const {
    shippingAddress: { line1, line2, city, state, postal_code },
    weightInOz,
  } = CalculateShipmentSchema.parse(await request.json())
  const shipment = await easyPost.Shipment.create({
    from_address: {
      street1: '62 Morell St',
      city: 'New Brunswick',
      state: 'NJ',
      zip: '08901',
    },
    to_address: {
      street1: line1,
      street2: line2,
      city,
      state,
      zip: postal_code,
    },
    parcel: {
      length: 15.5,
      width: 12,
      height: 6,
      weight: weightInOz,
    },
  } satisfies IShipmentCreateParameters)
  if (!shipment.rates)
    throw error(400, { message: 'No viable shipments found' })
  return json({
    shipmentId: shipment.id,
    cheapestShipmentInCents: Math.floor(
      parseFloat(shipment.lowestRate()?.rate) * 100 * 1.1,
    ),
  } satisfies CalculatedShipmentSchema)
}
