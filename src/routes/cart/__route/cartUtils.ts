import type { LineItemWithProduct } from '$lib/pocketbase/derived-pocketbase-types'
import type { ProductFieldRecord, ProductResponse } from '$lib/pocketbase/pocketbase-types'
import _ from 'lodash'
import { get, writable } from 'svelte/store'

export function getCartTotal<T extends LineItemWithProduct>(
  cart: T[],
  withDiscount?: boolean,
) {
  return _.sumBy(cart, (item) => getLineItemPrice(item, withDiscount))
}

export function getLineItemPrice<T extends LineItemWithProduct>(
  lineItem: T,
  withDiscount?: boolean,
) {
  return (
    lineItem.quantity * getUnitPrice(lineItem.expand!.product, withDiscount)
  )
}

export const validDiscount = writable(false)
export function getUnitPrice<T extends ProductResponse>(
  product?: T,
  withDiscount?: boolean,
) {
  if (!product) return 0
  if (
    (withDiscount ?? get(validDiscount)) &&
    product.teamPriceInCents !== undefined
  ) {
    return product.teamPriceInCents
  }
  return product.priceInCents
}

export function getCartWeight<T extends LineItemWithProduct>(cart: T[]) {
    return _.sumBy(cart, item => (item.expand!.product.weightInOz ?? 0) * item.quantity)
}