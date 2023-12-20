import { pb } from "$lib/pocketbase/pb";
import type { ProductResponse } from "$lib/pocketbase/pocketbase-types";
import { get, writable } from "svelte/store";

const products = writable<ProductResponse[]>()

export async function load(){

    if(!get(products)) {
        products.set(await pb.collection('product').getFullList({
            sort: 'title',
            filter: 'enabled = true'
        }))
    }

    return {
        products: get(products)
    }
}