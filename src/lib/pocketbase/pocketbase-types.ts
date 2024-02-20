/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	CartSize = "cart_size",
	Color = "color",
	DiscountCodes = "discount_codes",
	LineItem = "line_item",
	NonRUltimateOrders = "non_r_ultimate_orders",
	Order = "order",
	OrderLineItem = "order_line_item",
	Product = "product",
	ProductField = "product_field",
	StoreSection = "store_section",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type CartSizeRecord<TsumQuantity = unknown> = {
	numLineItems?: number
	sumQuantity?: null | TsumQuantity
}

export type ColorRecord = {
	color: string
	name: string
}

export type DiscountCodesRecord = {
	active?: boolean
	code?: string
}

export type LineItemRecord<Tfields = unknown> = {
	fields?: null | Tfields
	product: RecordIdString
	quantity: number
	user?: RecordIdString
}

export type NonRUltimateOrdersRecord<Tdark = unknown, Tdark_shorts = unknown, Twhite = unknown> = {
	dark?: null | Tdark
	dark_shorts?: null | Tdark_shorts
	email?: string
	name?: string
	white?: null | Twhite
}

export type OrderRecord<TshippingAddress = unknown> = {
	discountCode?: string
	profitInCents?: number
	shippingAddress?: null | TshippingAddress
	shippingCostInCents?: number
	stripePaymentId?: string
	subtotal?: number
	testOrder?: boolean
	totalInCents?: number
	user?: RecordIdString
}

export type OrderLineItemRecord<Tfields = unknown> = {
	fields?: null | Tfields
	fulfilled?: boolean
	order: RecordIdString
	product: RecordIdString
	profitCents?: number
	quantity: number
	totalCents?: number
	unitPriceCents?: number
}

export type ProductRecord = {
	description?: string
	enabled?: boolean
	fields?: RecordIdString[]
	galleryImages?: string[]
	priceInCents: number
	primaryImage?: string
	requiredForPlayers?: boolean
	slug: string
	teamPriceInCents?: number
	title: string
	weightInOz?: number
}

export enum ProductFieldTypeOptions {
	"options" = "options",
	"text" = "text",
	"number" = "number",
	"color" = "color",
}
export type ProductFieldRecord<TpriceIncreaseArray = unknown> = {
	colors?: RecordIdString[]
	internal_name?: string
	optional?: boolean
	options?: string
	priceIncreaseArray?: null | TpriceIncreaseArray
	title?: string
	type?: ProductFieldTypeOptions
}

export type StoreSectionRecord = {
	allow_preview?: RecordIdString[]
	enabled?: boolean
	order?: number
	products?: RecordIdString[]
	title?: string
}

export type UsersRecord = {
	avatar?: string
	isManager?: boolean
	name?: string
	name_manually_set?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type CartSizeResponse<TsumQuantity = unknown, Texpand = unknown> = Required<CartSizeRecord<TsumQuantity>> & BaseSystemFields<Texpand>
export type ColorResponse<Texpand = unknown> = Required<ColorRecord> & BaseSystemFields<Texpand>
export type DiscountCodesResponse<Texpand = unknown> = Required<DiscountCodesRecord> & BaseSystemFields<Texpand>
export type LineItemResponse<Tfields = unknown, Texpand = unknown> = Required<LineItemRecord<Tfields>> & BaseSystemFields<Texpand>
export type NonRUltimateOrdersResponse<Tdark = unknown, Tdark_shorts = unknown, Twhite = unknown, Texpand = unknown> = Required<NonRUltimateOrdersRecord<Tdark, Tdark_shorts, Twhite>> & BaseSystemFields<Texpand>
export type OrderResponse<TshippingAddress = unknown, Texpand = unknown> = Required<OrderRecord<TshippingAddress>> & BaseSystemFields<Texpand>
export type OrderLineItemResponse<Tfields = unknown, Texpand = unknown> = Required<OrderLineItemRecord<Tfields>> & BaseSystemFields<Texpand>
export type ProductResponse<Texpand = unknown> = Required<ProductRecord> & BaseSystemFields<Texpand>
export type ProductFieldResponse<TpriceIncreaseArray = unknown, Texpand = unknown> = Required<ProductFieldRecord<TpriceIncreaseArray>> & BaseSystemFields<Texpand>
export type StoreSectionResponse<Texpand = unknown> = Required<StoreSectionRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	cart_size: CartSizeRecord
	color: ColorRecord
	discount_codes: DiscountCodesRecord
	line_item: LineItemRecord
	non_r_ultimate_orders: NonRUltimateOrdersRecord
	order: OrderRecord
	order_line_item: OrderLineItemRecord
	product: ProductRecord
	product_field: ProductFieldRecord
	store_section: StoreSectionRecord
	users: UsersRecord
}

export type CollectionResponses = {
	cart_size: CartSizeResponse
	color: ColorResponse
	discount_codes: DiscountCodesResponse
	line_item: LineItemResponse
	non_r_ultimate_orders: NonRUltimateOrdersResponse
	order: OrderResponse
	order_line_item: OrderLineItemResponse
	product: ProductResponse
	product_field: ProductFieldResponse
	store_section: StoreSectionResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'cart_size'): RecordService<CartSizeResponse>
	collection(idOrName: 'color'): RecordService<ColorResponse>
	collection(idOrName: 'discount_codes'): RecordService<DiscountCodesResponse>
	collection(idOrName: 'line_item'): RecordService<LineItemResponse>
	collection(idOrName: 'non_r_ultimate_orders'): RecordService<NonRUltimateOrdersResponse>
	collection(idOrName: 'order'): RecordService<OrderResponse>
	collection(idOrName: 'order_line_item'): RecordService<OrderLineItemResponse>
	collection(idOrName: 'product'): RecordService<ProductResponse>
	collection(idOrName: 'product_field'): RecordService<ProductFieldResponse>
	collection(idOrName: 'store_section'): RecordService<StoreSectionResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
