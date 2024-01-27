import type {
  ExpandedField,
  ExpandedProduct,
} from '$lib/pocketbase/derived-pocketbase-types'
import {
  ProductFieldTypeOptions
} from '$lib/pocketbase/pocketbase-types'
import { ZodSchema, z } from 'zod'

export const GenericAddToCartSchema = z.object({
  quantity: z.number().int().positive(),
  fields: z.record(z.string(), z.any()),
})

export function getAddToCartSchema(product: ExpandedProduct) {
  return z.object({
    quantity: z.number().int().positive(),
    fields: z.object(
      product.expand?.fields.reduce(
        (obj, field) => ({ ...obj, [field.title]: getSchemaForField(field) }),
        {},
      ) ?? {},
    ),
  })
}
function getSchemaForField(field: ExpandedField) {
  let schema: ZodSchema
  switch (field.type) {
    case ProductFieldTypeOptions.text:
      schema = z.string()
      break
    case ProductFieldTypeOptions.number:
      schema = z.number()
      break
    case ProductFieldTypeOptions.options:
      const options = field.options.split(',').map(x => x.trim())
      schema = options.length ? z.enum(options as any) : z.string()
      break
    case ProductFieldTypeOptions.color:
      schema = field.expand?.colors.length ? z.enum(field.expand.colors.map(c => c.name) as any) : z.string()
      break
    default:
      return z.string()
  }
  if(field.optional) {
    return schema.optional();
  }
  return schema
}
