import {
  productExpansionString,
  type ExpandedProduct,
} from '$lib/pocketbase/derived-pocketbase-types'
import type { LineItemRecord, TypedPocketBase } from '$lib/pocketbase/pocketbase-types'
import { error, fail } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'
import type { PageServerLoad } from './$types'
import { getAddToCartSchema } from './schemas'
import _ from 'lodash'
import { getCartItems } from '$lib/pocketbase/cart'

export const load: PageServerLoad = async ({ locals: { pb }, params }) => {
  const product = await getProduct(pb, params.slug)
  if (!product) throw error(404, { message: "Product doesn't exist" })

  return {
    addToCartForm: await superValidate(getAddToCartSchema(product)),
    product,
  }
}

export const actions = {
  async default({ request, locals: { pb, user }, params }) {
    const product = await getProduct(pb, params.slug)
    const form = await superValidate(request, getAddToCartSchema(product))

    if (!form.valid) {
      console.error('Form was invalid', form)
      return fail(400, { form })
    }

    const cartItems = await getCartItems();
    const existingItem = cartItems.items.find(
      (item) =>
        item.product === product.id && _.isEqual(item.fields, form.data.fields),
    )
    if (existingItem) {
      await pb
        .collection('line_item')
        .update(existingItem.id, { 'quantity+': form.data.quantity })
    } else {
      await pb.collection('line_item').create({
        ...form.data,
        product: product.id,
        user: user.id,
      } satisfies LineItemRecord)
    }
    return message(form, 'Successfully added to cart')
  },
}

async function getProduct(pb: TypedPocketBase, slug: string) {
  return pb
    .collection('product')
    .getFirstListItem<ExpandedProduct>(`slug='${slug}'`, {
      expand: productExpansionString,
    })
}
