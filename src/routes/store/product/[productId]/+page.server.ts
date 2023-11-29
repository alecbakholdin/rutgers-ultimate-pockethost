import type { ProductFieldResponse, ProductResponse } from "$lib/pocketbase-types";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { pb }, params }) => {

    async function getProduct() {
        const product = await pb.collection('product').getOne<ProductResponse<{ fields: ProductFieldResponse }>>(params.productId, { expand: "fields" });
        if (!product) {
            throw error(404, { message: "Product doesn't exist" })
        }
        return product;
    }

    return {
        product: await getProduct()
    }
}