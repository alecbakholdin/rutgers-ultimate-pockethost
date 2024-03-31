/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	CartSize = "cart_size",
	Color = "color",
	DiscountCodes = "discount_codes",
	Game = "game",
	GamePoint = "game_point",
	GamePointEvent = "game_point_event",
	LineItem = "line_item",
	NonRUltimateOrders = "non_r_ultimate_orders",
	Order = "order",
	OrderLineItem = "order_line_item",
	Player = "player",
	Product = "product",
	ProductField = "product_field",
	StoreSection = "store_section",
	Team = "team",
	TeamGroup = "team_group",
	Tournament = "tournament",
	Users = "users",
	VendorOrder = "vendor_order",
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

export enum GameStatusOptions {
	"Planned" = "Planned",
	"In Progress" = "In Progress",
	"Halftime" = "Halftime",
	"Timeout" = "Timeout",
	"Final" = "Final",
}
export type GameRecord = {
	end?: IsoDateString
	opponent: string
	opponent_score?: number
	start?: IsoDateString
	status?: GameStatusOptions
	team: RecordIdString
	team_score?: number
}

export enum GamePointTypeOptions {
	"O" = "O",
	"D" = "D",
	"Final" = "Final",
}
export type GamePointRecord = {
	assist?: RecordIdString
	game: RecordIdString
	goal?: RecordIdString
	opponent_goal?: boolean
	opponent_score?: number
	starting_line?: RecordIdString[]
	subs?: RecordIdString[]
	team_score?: number
	type: GamePointTypeOptions
}

export enum GamePointEventTypeOptions {
	"Turn" = "Turn",
	"Drop" = "Drop",
	"Substitution" = "Substitution",
	"Block" = "Block",
}
export type GamePointEventRecord = {
	game_point: RecordIdString
	opponent?: boolean
	player?: RecordIdString
	type?: GamePointEventTypeOptions
	message?: string
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
	received?: boolean
	totalCents?: number
	unitPriceCents?: number
}

export enum PlayerStatusOptions {
	"active" = "active",
	"injured" = "injured",
	"inactive" = "inactive",
}
export type PlayerRecord = {
	name: string
	status?: PlayerStatusOptions
	team: RecordIdString
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

export type TeamRecord = {
	live_game?: RecordIdString
	logo?: string
	name: string
	slug: string
}

export type TeamGroupRecord = {
	color?: string
	name: string
	players?: RecordIdString[]
	team: RecordIdString
}

export type TournamentRecord = {
	end: IsoDateString
	field?: RecordIdString
	slug: string
	start: IsoDateString
	title: string
}

export type UsersRecord = {
	avatar?: string
	isManager?: boolean
	name?: string
	name_manually_set?: boolean
}

export type VendorOrderRecord = {
	end_date?: IsoDateString
	managers?: RecordIdString[]
	products?: RecordIdString[]
	start_date?: IsoDateString
	title?: string
}

// Response types include system fields and match responses from the PocketBase API
export type CartSizeResponse<TsumQuantity = unknown, Texpand = unknown> = Required<CartSizeRecord<TsumQuantity>> & BaseSystemFields<Texpand>
export type ColorResponse<Texpand = unknown> = Required<ColorRecord> & BaseSystemFields<Texpand>
export type DiscountCodesResponse<Texpand = unknown> = Required<DiscountCodesRecord> & BaseSystemFields<Texpand>
export type GameResponse<Texpand = unknown> = Required<GameRecord> & BaseSystemFields<Texpand>
export type GamePointResponse<Texpand = unknown> = Required<GamePointRecord> & BaseSystemFields<Texpand>
export type GamePointEventResponse<Texpand = unknown> = Required<GamePointEventRecord> & BaseSystemFields<Texpand>
export type LineItemResponse<Tfields = unknown, Texpand = unknown> = Required<LineItemRecord<Tfields>> & BaseSystemFields<Texpand>
export type NonRUltimateOrdersResponse<Tdark = unknown, Tdark_shorts = unknown, Twhite = unknown, Texpand = unknown> = Required<NonRUltimateOrdersRecord<Tdark, Tdark_shorts, Twhite>> & BaseSystemFields<Texpand>
export type OrderResponse<TshippingAddress = unknown, Texpand = unknown> = Required<OrderRecord<TshippingAddress>> & BaseSystemFields<Texpand>
export type OrderLineItemResponse<Tfields = unknown, Texpand = unknown> = Required<OrderLineItemRecord<Tfields>> & BaseSystemFields<Texpand>
export type PlayerResponse<Texpand = unknown> = Required<PlayerRecord> & BaseSystemFields<Texpand>
export type ProductResponse<Texpand = unknown> = Required<ProductRecord> & BaseSystemFields<Texpand>
export type ProductFieldResponse<TpriceIncreaseArray = unknown, Texpand = unknown> = Required<ProductFieldRecord<TpriceIncreaseArray>> & BaseSystemFields<Texpand>
export type StoreSectionResponse<Texpand = unknown> = Required<StoreSectionRecord> & BaseSystemFields<Texpand>
export type TeamResponse<Texpand = unknown> = Required<TeamRecord> & BaseSystemFields<Texpand>
export type TeamGroupResponse<Texpand = unknown> = Required<TeamGroupRecord> & BaseSystemFields<Texpand>
export type TournamentResponse<Texpand = unknown> = Required<TournamentRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type VendorOrderResponse<Texpand = unknown> = Required<VendorOrderRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	cart_size: CartSizeRecord
	color: ColorRecord
	discount_codes: DiscountCodesRecord
	game: GameRecord
	game_point: GamePointRecord
	game_point_event: GamePointEventRecord
	line_item: LineItemRecord
	non_r_ultimate_orders: NonRUltimateOrdersRecord
	order: OrderRecord
	order_line_item: OrderLineItemRecord
	player: PlayerRecord
	product: ProductRecord
	product_field: ProductFieldRecord
	store_section: StoreSectionRecord
	team: TeamRecord
	team_group: TeamGroupRecord
	tournament: TournamentRecord
	users: UsersRecord
	vendor_order: VendorOrderRecord
}

export type CollectionResponses = {
	cart_size: CartSizeResponse
	color: ColorResponse
	discount_codes: DiscountCodesResponse
	game: GameResponse
	game_point: GamePointResponse
	game_point_event: GamePointEventResponse
	line_item: LineItemResponse
	non_r_ultimate_orders: NonRUltimateOrdersResponse
	order: OrderResponse
	order_line_item: OrderLineItemResponse
	player: PlayerResponse
	product: ProductResponse
	product_field: ProductFieldResponse
	store_section: StoreSectionResponse
	team: TeamResponse
	team_group: TeamGroupResponse
	tournament: TournamentResponse
	users: UsersResponse
	vendor_order: VendorOrderResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'cart_size'): RecordService<CartSizeResponse>
	collection(idOrName: 'color'): RecordService<ColorResponse>
	collection(idOrName: 'discount_codes'): RecordService<DiscountCodesResponse>
	collection(idOrName: 'game'): RecordService<GameResponse>
	collection(idOrName: 'game_point'): RecordService<GamePointResponse>
	collection(idOrName: 'game_point_event'): RecordService<GamePointEventResponse>
	collection(idOrName: 'line_item'): RecordService<LineItemResponse>
	collection(idOrName: 'non_r_ultimate_orders'): RecordService<NonRUltimateOrdersResponse>
	collection(idOrName: 'order'): RecordService<OrderResponse>
	collection(idOrName: 'order_line_item'): RecordService<OrderLineItemResponse>
	collection(idOrName: 'player'): RecordService<PlayerResponse>
	collection(idOrName: 'product'): RecordService<ProductResponse>
	collection(idOrName: 'product_field'): RecordService<ProductFieldResponse>
	collection(idOrName: 'store_section'): RecordService<StoreSectionResponse>
	collection(idOrName: 'team'): RecordService<TeamResponse>
	collection(idOrName: 'team_group'): RecordService<TeamGroupResponse>
	collection(idOrName: 'tournament'): RecordService<TournamentResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
	collection(idOrName: 'vendor_order'): RecordService<VendorOrderResponse>
}
