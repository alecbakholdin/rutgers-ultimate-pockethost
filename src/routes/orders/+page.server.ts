import {
  fullOrderResponseExpansionString,
  type FullOrderResponse,
} from '$lib/pocketbase/derived-pocketbase-types.js'

export async function load({ locals: { pb, user } }) {
  return {
    orders: await pb.collection('order').getList<FullOrderResponse>(0, 5, {
      filter: `user='${user?.id ?? ''}'`,
      expand: fullOrderResponseExpansionString,
      sort: '-created',
    }),
  }
}
