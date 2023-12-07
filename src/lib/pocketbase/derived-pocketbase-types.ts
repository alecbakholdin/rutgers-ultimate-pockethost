import type {
  ColorResponse,
  LineItemResponse,
  ProductFieldResponse,
  ProductResponse,
} from './pocketbase-types'

export type ExpandedField = ProductFieldResponse<{ colors: ColorResponse[] }>
export type ExpandedProduct = ProductResponse<{ fields: ExpandedField[] }>
export const productExpansionString = 'fields.colors'