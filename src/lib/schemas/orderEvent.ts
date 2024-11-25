import { z } from 'zod'

export const OrderEvent = z.object({
  timestamp: z.string().datetime(),
  person: z.string(),
  type: z.enum(['Ordered from Vendor', 'Label Created', 'Shipped', 'Delivered']),
  details: z.string().optional(),
})
export const OrderEvents = z.array(OrderEvent)
