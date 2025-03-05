import type { OrderResponseTyped } from '$lib/pocketbase/derived-pocketbase-types.js'
import { pb } from '$lib/pocketbase/pb.js'
import type {
  OrderLineItemResponse,
  ProductFieldResponse,
  ProductResponse,
  StoreSectionResponse,
  UsersResponse,
} from '$lib/pocketbase/pocketbase-types.js'
import { error } from '@sveltejs/kit'

export async function load({ url, parent }) {
  const { user } = await parent()
  const availableSections = await getStoreSectionsForAdmin(user)

  const sectionId =
    url.searchParams.get('section_id') || availableSections[0].id
  const selectedSection =
    availableSections.find((s) => s.id == sectionId) || availableSections[0]
  const availableProducts = selectedSection.expand!.products

  return {
    availableSections,
    selectedSection,
    availableProducts,
    orderLineItems: await getOrderLineItems(availableProducts.map((p) => p.id)),
  }
}

export type tableRow = OrderLineItemResponse<
  any,
  {
    order: OrderResponseTyped<{ user: UsersResponse }>
    product: ProductResponse<{ fields: ProductFieldResponse[] }>
  }
>

type storeSectionResponse = StoreSectionResponse<{
  products: ProductResponse<{ fields: ProductFieldResponse[] }>[]
}>

// returns non-empty list of store sections user is allowed to preview
async function getStoreSectionsForAdmin(user: UsersResponse) {
  const storeSections = await pb
    .collection('store_section')
    .getFullList<storeSectionResponse>({
      requestKey: null,
      filter: pb.filter(`allow_preview ~ {:userId} && archived = false`, {
        userId: user?.id,
      }),
      expand: 'products.fields',
    })
  if ((storeSections?.length ?? 0) == 0) {
    throw error(400, {
      message: 'No non-archived store sections available. Contact support',
    })
  }
  return storeSections
}

async function getOrderLineItems(productIds: string[]) {
  const productFilter = productIds
    .map((_, i) => `product = {:${i}}`)
    .join(' || ')
  const paramObj = productIds.reduce((a, b, i) => ({ ...a, [`${i}`]: b }), {})
  return pb.collection('order_line_item').getFullList<tableRow>({
    filter: pb.filter(
      `(${productFilter}) && order.created > {:recentSeptember} && order.testOrder = false`,
      {
        ...paramObj,
        recentSeptember: getMostRecentSeptember(),
      },
    ),
    sort: '-order.created',
    expand: 'order.user, product.fields',
  })
}

function getMostRecentSeptember(): Date {
  const today = new Date()
  const year =
    today.getMonth() < 9 ? today.getFullYear() - 1 : today.getFullYear()
  return new Date(year, 8)
}
