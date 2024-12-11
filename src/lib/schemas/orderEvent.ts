import { z } from 'zod'

export const DefaultOrderStatus = 'Pending'
export const OrderStatus = z.enum([
  DefaultOrderStatus,
  'Label Created',
  'Shipped',
  'Delivered',
])
export const OrderEvent = z.object({
  timestamp: z.string().datetime(),
  person: z.string(),
  type: OrderStatus.exclude([DefaultOrderStatus]),
  details: z.string().optional(),
})
export const OrderEvents = z.array(OrderEvent)
