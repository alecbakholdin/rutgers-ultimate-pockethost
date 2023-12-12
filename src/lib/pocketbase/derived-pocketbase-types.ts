import type {
  ColorResponse,
  LineItemResponse,
  ProductFieldResponse,
  ProductResponse
} from './pocketbase-types'

export type ExpandedField = ProductFieldResponse<{ colors: ColorResponse[] }>
export type ExpandedProduct = ProductResponse<{ fields: ExpandedField[] }>
export const productExpansionString = 'fields.colors'

export type LineItemWithProduct = LineItemResponse<
  NonNullable<Record<string, any>>,
  { product: ProductResponse }
>