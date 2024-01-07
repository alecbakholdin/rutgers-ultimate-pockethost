import { pb } from '$lib/pocketbase/pb'
import type { NonRUltimateOrdersResponse } from '$lib/pocketbase/pocketbase-types'

export async function load() {
  return {
    completedOrders: await pb
      .collection('non_r_ultimate_orders')
      .getFullList<NonRUltimateOrdersResponse<number, number, number>>({
        sort: '+name'
      }),
  }
}
