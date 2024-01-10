import type { OrderResponseTyped } from '$lib/pocketbase/derived-pocketbase-types.js'
import { pb } from '$lib/pocketbase/pb.js'
import type {
  OrderLineItemResponse,
  ProductFieldResponse,
  ProductResponse,
  StoreSectionResponse,
  UsersResponse,
} from '$lib/pocketbase/pocketbase-types.js'

const machineJersysId = 'i79vnh3trmzgmva'
export async function load({ url }) {
  const productId = url.searchParams.get('productId')
  const storeSection = await pb
    .collection('store_section')
    .getOne<StoreSectionResponse<{ products: ProductResponse<{fields: ProductFieldResponse[]}>[] }>>(
      machineJersysId,
      { expand: 'products.fields' },
    )
  const products = storeSection.expand!.products
  const product =
    (productId && products.find((p) => p.id === productId)) || products[0]

  const productLineItems = await pb
    .collection('order_line_item')
    .getFullList<
      OrderLineItemResponse<
        any,
        { order: OrderResponseTyped<{ user: UsersResponse }> }
      >
    >({
      filter: pb.filter('product = {:productId}', { productId: product.id }),
      expand: 'order.user',
    })

  return {
    products,
    productId,
    product,
    productLineItems,
  }
}
