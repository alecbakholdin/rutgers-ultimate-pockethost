import {
  fullOrderLineItemResponseExpansionString,
  type FullOrderLineItemResponse,
} from '$lib/pocketbase/derived-pocketbase-types.js'
import { pb } from '$lib/pocketbase/pb.js'

export async function load({ url }) {
  const search = url.searchParams.get('q') || ''

  const r = /^(?:fields)|f\.([\w\s]+)(=|~)(.*)$/
  const searchTerms = search.split(/\s+/g)
  const stringSearchClauses = searchTerms
    .filter((s) => !s.match(r))
    .map(
      (_, i) =>
        `(${['order.user.name', 'order.user.email', 'product.title', 'fields']
          .map((field) => `${field} ~ {:q${i}}`)
          .join(' || ')})`,
    )
  const stringSearchObj = stringSearchClauses.reduce(
    (acc, _, i) => ({ ...acc, [`q${i}`]: searchTerms[i] }),
    {},
  )

  const fieldFilters = searchTerms.map((s) => s.match(r)).filter(Boolean)
  const fieldFilterClauses = fieldFilters.map(
    (f, i) => `fields.${f![1]} ${f![2]} {:f${i}}`,
  )
  const fieldFilterObj = fieldFilters.reduce(
    (acc, f, i) => ({ ...acc, [`f${i}`]: f![3] }),
    {},
  )
  const filterStr = [...fieldFilterClauses, ...stringSearchClauses].join(' && ')
  const filterObj = { ...fieldFilterObj, ...stringSearchObj };


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
