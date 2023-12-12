import type { ExpandedProduct, LineItemWithProduct, ProductFieldTyped } from '$lib/pocketbase/derived-pocketbase-types'
import type { ProductResponse } from '$lib/pocketbase/pocketbase-types'
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
  let productUnitPrice = getUnitPriceWithFields(lineItem.expand!.product, lineItem.fields, withDiscount);
  
  return (
    lineItem.quantity * productUnitPrice
  )
}

export const validDiscount = writable(false);
export function getUnitPriceWithFields<TProduct extends ProductResponse>(product: TProduct | undefined, fields: Record<string, string> | null, withDiscount?: boolean) {
  let unitPrice = getUnitPrice(product, withDiscount);
  const productFields = (product as ExpandedProduct)?.expand?.fields;
  if(!productFields) return unitPrice;
  for(const field of productFields) {
    unitPrice += getProductFieldPriceIncrease(field, fields?.[field.title]);
  }
  return unitPrice;
}

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

export function getProductFieldPriceIncrease<T extends ProductFieldTyped>(productField?: T, option?: string) {
    const priceIncreaseArr = productField?.priceIncreaseArray;
    if(!priceIncreaseArr || !option) return 0;
    for(const {regex, priceIncreaseInCents} of priceIncreaseArr) {
      if(option.match(regex)) {
        return priceIncreaseInCents;
      }
    }
    return 0;
}

export function getCartWeight<T extends LineItemWithProduct>(cart: T[]) {
    return _.sumBy(cart, item => (item.expand!.product.weightInOz ?? 0) * item.quantity)
}