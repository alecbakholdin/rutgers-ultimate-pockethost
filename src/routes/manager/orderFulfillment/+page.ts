import {
  fullOrderLineItemResponseExpansionString,
  type FullOrderLineItemResponse,
} from '$lib/pocketbase/derived-pocketbase-types.js'
import { pb } from '$lib/pocketbase/pb.js'

// the following are treated as field filters:
//    fields.name=test  -name is "test"
//    f.name=test       -name is "test"
//    f.name~test       -name contains "test"
const fieldFilterRegex = /^(?:fields)|f\.([\w\s]+)(=|~)(.*)$/
function isNotFieldFilter(t: string): boolean {
  return !isFieldFilter(t)
}
function isFieldFilter(t: string): boolean {
  return Boolean(t.match(fieldFilterRegex))
}

// finds only orders since the last September, indicating the start of a new school season
export async function load({ url }) {
  const searchStr = url.searchParams.get('q') || ''
  const searchTokens = searchStr.trim().split(/\s+/g)

  // does a whole-string search on a few fields
  const stringSearchClauses = searchTokens
    .filter(isNotFieldFilter)
    .map(
      (_, i) =>
        `(${['order.user.name', 'order.user.email', 'product.title', 'fields']
          .map((field) => `${field} ~ {:q${i}}`)
          .join(' || ')})`,
    )
  const stringSearchObj = stringSearchClauses.reduce(
    (acc, _, i) => ({ ...acc, [`q${i}`]: searchTokens[i] }),
    {},
  )

  // processes field-specific filters e.g. "name contains" or "name equals"
  const fieldFilters = searchTokens.filter(isFieldFilter)
  const fieldFilterClauses = fieldFilters.map(
    (f, i) => `fields.${f![1]} ${f![2]} {:f${i}}`,
  )
  const fieldFilterObj = fieldFilters.reduce(
    (acc, f, i) => ({ ...acc, [`f${i}`]: f![3] }),
    {},
  )


  const filterStr = [
    ...fieldFilterClauses,
    ...stringSearchClauses,
    'order.created > {:lastSeptember}',
  ].join(' && ')

  const filterObj = {
    ...fieldFilterObj,
    ...stringSearchObj,
    lastSeptember: getMostRecentSeptember(),
  }

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

function getMostRecentSeptember(): Date {
  const today = new Date()
  const year =
    today.getMonth() < 9 ? today.getFullYear() - 1 : today.getFullYear()
  return new Date(year, 8)
}
