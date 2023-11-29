/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Color = "color",
	Product = "product",
	ProductField = "product_field",
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

export type ColorRecord = {
	color: string
	name: string
}

export type ProductRecord = {
	enabled?: boolean
	fields?: RecordIdString[]
	galleryImages?: string[]
	priceInCents: number
	primaryImage?: string
	teamPriceInCents?: number
	title: string
}

export enum ProductFieldFieldOptions {
	"options" = "options",
	"text" = "text",
	"number" = "number",
	"color" = "color",
}
export type ProductFieldRecord = {
	colors?: RecordIdString[]
	field?: ProductFieldFieldOptions
	options?: string
	title?: string
}

export type UsersRecord = {
	avatar?: string
	name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type ColorResponse<Texpand = unknown> = Required<ColorRecord> & BaseSystemFields<Texpand>
export type ProductResponse<Texpand = unknown> = Required<ProductRecord> & BaseSystemFields<Texpand>
export type ProductFieldResponse<Texpand = unknown> = Required<ProductFieldRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	color: ColorRecord
	product: ProductRecord
	product_field: ProductFieldRecord
	users: UsersRecord
}

export type CollectionResponses = {
	color: ColorResponse
	product: ProductResponse
	product_field: ProductFieldResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'color'): RecordService<ColorResponse>
	collection(idOrName: 'product'): RecordService<ProductResponse>
	collection(idOrName: 'product_field'): RecordService<ProductFieldResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
