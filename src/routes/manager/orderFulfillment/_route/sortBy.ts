import { type FullOrderLineItemResponse } from '$lib/pocketbase/derived-pocketbase-types'

export type OrderFulfillmentSortBy = { field: string; asc: boolean }

export function sortedOrders(
  orders: FullOrderLineItemResponse[],
  sortBy: OrderFulfillmentSortBy | undefined,
): FullOrderLineItemResponse[] {
  if (!sortBy) {
    return orders
  }
  return [...orders].sort((a, b) => {
    const valA = a.fields?.[sortBy!.field]?.trim() || ''
    const valB = b.fields?.[sortBy!.field]?.trim() || ''

    const numCompare = typeof valA === 'number' && typeof valB === 'number'
    const factor = sortBy!.asc ? 1 : -1
    return (
      factor *
      (numCompare
        ? parseFloat(valA) - parseFloat(valB)
        : valA.localeCompare(valB))
    )
  })
}
