import {
  fullOrderLineItemResponseExpansionString,
  type FullOrderLineItemResponse,
} from '$lib/pocketbase/derived-pocketbase-types.js'
import { pb } from '$lib/pocketbase/pb.js'

export async function load({ url }) {
  const search = url.searchParams.get('q')

  if (!search) {
    return {
      orders: [],
    }
  }

  const searchTerms = search.split(/\s+/g)
  const filterStr = searchTerms
    .map((_, i) => `(${
      ['order.user.name', 'order.user.email', 'product.title', 'fields'].map(
        (field) => `${field} ~ {:q${i}}`,
      ).join(' || ')})`,
    )
    .join(' && ')
  const filterObj = searchTerms.reduce(
    (acc, _, i) => ({ ...acc, [`q${i}`]: searchTerms[i] }),
    {},
  )

  const filter = pb.filter(filterStr, filterObj)
  console.log(filter)
  return {
    orders: await pb
      .collection('order_line_item')
      .getFullList<FullOrderLineItemResponse>({
        filter,
        expand: fullOrderLineItemResponseExpansionString,
      }),
  }
}
