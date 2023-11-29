import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({locals: {pb}}) => {
    return {
        products: {
            list: pb.collection('product').getFullList({
                sort: 'title',
                filter: 'enabled = true'
            })
        }
    }
}