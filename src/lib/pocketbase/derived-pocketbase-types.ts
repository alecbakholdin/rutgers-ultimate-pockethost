import type { z } from 'zod'
import type {
  ColorResponse,
  LineItemResponse,
  OrderLineItemResponse,
  OrderResponse,
  ProductFieldResponse,
  ProductResponse,
} from './pocketbase-types'
import type { ShippingAddressSchema } from '$lib/schemas/shipping'

export type ProductFieldTyped<Texpand = unknown> = ProductFieldResponse<
  { regex: string; priceIncreaseInCents: number }[],
  Texpand
>
export type ExpandedField = ProductFieldTyped<{ colors: ColorResponse[] }>
export type ExpandedProduct = ProductResponse<{ fields: ExpandedField[] }>
export const productExpansionString = 'fields.colors'

export type LineItemResponseTyped<Texpand = unknown> = LineItemResponse<
  Record<string, string>,
  Texpand
>
export type LineItemWithProduct<TProductExpand = unknown> =
  LineItemResponseTyped<{ product: ProductResponse<TProductExpand> }>
export type ExpandedLineItem = LineItemResponseTyped<{product: ExpandedProduct}>
export const lineItemExpansionString = `product.fields.colors`

export type OrderResponseTyped<Texpand> = OrderResponse<
  z.infer<typeof ShippingAddressSchema>,
  Texpand
>
export type FullOrderResponse<TProductExpand = unknown> = OrderResponseTyped<{
  'order_line_item(order)': OrderLineItemResponse<
    Record<string, string>,
    { product: ProductResponse<TProductExpand> }
  >[]
}>
export const fullOrderResponseExpansionString = 'order_line_item(order).product'
