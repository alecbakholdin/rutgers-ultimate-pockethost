import type {
  OrderLineItemRecord,
  OrderRecord,
} from '$lib/pocketbase/pocketbase-types'
import type { z } from 'zod'
import type { ShippingAddressSchema } from './shipping'

export type CompleteCheckoutType = {
  order: OrderRecord<z.infer<typeof ShippingAddressSchema>>
  lineItems: OrderLineItemRecord[]
}
