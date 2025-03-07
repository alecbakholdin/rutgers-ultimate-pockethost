import type { z } from 'zod'
import type {
  ColorResponse,
  LineItemResponse,
  OrderLineItemRecord,
  OrderLineItemResponse,
  OrderRecord,
  OrderResponse,
  ProductFieldResponse,
  ProductResponse,
  UsersResponse,
  StoreSectionResponse,
} from './pocketbase-types'
import type { ShippingAddressSchema } from '$lib/schemas/shipping'
import { OrderEvents } from '$lib/schemas/orderEvent';

export type ProductFieldTyped<Texpand = unknown> = ProductFieldResponse<
  { regex: string; priceIncreaseInCents: number }[],
  Texpand
>
export type ExpandedField = ProductFieldTyped<{ colors: ColorResponse[] }>
export type ExpandedProduct = ProductResponse<{ fields: ExpandedField[] }>
export const productExpansionString = 'fields.colors'

export type ExpandedStoreSection = StoreSectionResponse<{
  products: ExpandedProduct[]
}>
export const storeSectionExpansionString = 'products.' + productExpansionString

export type LineItemResponseTyped<Texpand = unknown> = LineItemResponse<
  Record<string, string>,
  Texpand
>
export type LineItemWithProduct<TProductExpand = unknown> =
  LineItemResponseTyped<{ product: ProductResponse<TProductExpand> }>
export type ExpandedLineItem = LineItemResponseTyped<{
  product: ExpandedProduct
}>
export const lineItemExpansionString = `product.fields.colors`

export type OrderResponseTyped<Texpand = unknown> = OrderResponse<
  z.infer<typeof OrderEvents>,
  z.infer<typeof ShippingAddressSchema>,
  Texpand
>
export type OrderRecordTyped = OrderRecord<
  z.infer<typeof ShippingAddressSchema>
>
export type FullOrderResponse<TProductExpand = unknown> = OrderResponseTyped<{
  user: UsersResponse
  'order_line_item(order)': OrderLineItemResponse<
    Record<string, string>,
    { product: ProductResponse<TProductExpand> }
  >[]
}>
export const fullOrderResponseExpansionString =
  'order_line_item(order).product,user'
export type OrderLineItemRecordTyped = OrderLineItemRecord<
  Record<string, string>
>
export type OrderLineItemResponseTyped<Texpand = unknown> =
  OrderLineItemResponse<Record<string, string>, Texpand>
export type FullOrderLineItemResponse = OrderLineItemResponseTyped<{
  product: ProductResponse
  order: FullOrderResponse
}>
export const fullOrderLineItemResponseExpansionString = 'product,order.user,order.order_line_item(order).product'
