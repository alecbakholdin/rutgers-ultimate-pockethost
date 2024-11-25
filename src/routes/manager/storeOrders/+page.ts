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

type storeSectionResponse = StoreSectionResponse<{
  products: ProductResponse<{ fields: ProductFieldResponse[] }>[]
}>
type tableRow = OrderLineItemResponse<
  any,
  { order: OrderResponseTyped<{ user: UsersResponse }> }
>

export async function load({ url, parent }) {
  const { user } = await parent()
  const storeSections = await pb
    .collection('store_section')
    .getFullList<storeSectionResponse>({
      requestKey: null,
      filter: pb.filter(`allow_preview ~ {:userId} && archived = false`, {
        userId: user?.id,
      }),
      expand: 'products.fields',
    })
  if (storeSections.length == 0) {
    throw error(400, { message: 'No non-archived store sections available' })
  }

  const sectionId = getStoredSectionId(url) ?? storeSections[0].id
  const storeSection = storeSections.find((s) => s.id == sectionId)
  if (!storeSection) {
    throw error(400, { message: "Store section doesn't exist" })
  }

  const productId =
    url.searchParams.get('productId') ?? storeSection.products[0]
  const product = storeSection.expand!.products.find((p) => p.id === productId)
  if (!product) {
    throw error(400, { message: "Product doesn't exist" })
  }

  const productLineItems = await pb
    .collection('order_line_item')
    .getFullList<tableRow>({
      filter: pb.filter('product = {:productId}', { productId: productId }),
      expand: 'order.user',
    })

  return {
    sectionId,
    storeSections,
    storeSection,
    products: storeSection.expand!.products,
    productId,
    product,
    productLineItems,
  }
}

function getStoredSectionId(url: URL) {
  const urlSectionId = url.searchParams.get('sectionId')
  if (typeof localStorage === 'undefined') return urlSectionId
  if (urlSectionId) {
    localStorage.setItem('managerSectionId', urlSectionId)
  }
  return localStorage.getItem('managerSectionId')
}
