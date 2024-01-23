import type { OrderResponseTyped } from '$lib/pocketbase/derived-pocketbase-types.js'
import { pb } from '$lib/pocketbase/pb.js'
import type {
  OrderLineItemResponse,
  ProductFieldResponse,
  ProductResponse,
  StoreSectionResponse,
  UsersResponse,
} from '$lib/pocketbase/pocketbase-types.js'

const machineJerseysId = 'i79vnh3trmzgmva'
export async function load({ url }) {
  const sectionId = (() => {
    const urlSectionId = url.searchParams.get('sectionId');
    if(typeof localStorage === 'undefined') return urlSectionId ?? machineJerseysId;
    if(urlSectionId) {
      localStorage.setItem('managerSectionId', urlSectionId);
    }
    return localStorage.getItem('managerSectionId') ?? machineJerseysId;
  })()
  const productId = url.searchParams.get('productId')

  const storeSections = await pb.collection('store_section').getFullList();
  const storeSection = await pb
    .collection('store_section')
    .getOne<StoreSectionResponse<{ products: ProductResponse<{fields: ProductFieldResponse[]}>[] }>>(
      sectionId,
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
    sectionId,
    storeSections,
    storeSection,
    products,
    productId,
    product,
    productLineItems,
  }
}
