import { z } from 'zod'

export const CreateDiscountCodeSchema = z.object({
  discountCode: z.string().optional(),
})
