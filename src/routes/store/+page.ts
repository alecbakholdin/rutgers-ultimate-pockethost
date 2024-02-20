import { currentUser, pb } from "$lib/pocketbase/pb";
import type { ProductResponse, StoreSectionResponse } from "$lib/pocketbase/pocketbase-types";
import { get, writable } from "svelte/store";

type StoreSectionExpanded = StoreSectionResponse<{products: ProductResponse[]}>;
const storeSections = writable<StoreSectionExpanded[]>();

export async function load(){

    if(!get(storeSections)) {
        const userId = get(currentUser)?.id
        const filter = userId ? pb.filter('enabled = true || allow_preview ~ {:userId}', {userId}) : 'enabled=true'
        const resp = await pb.collection('store_section').getFullList<StoreSectionExpanded>({
            filter,
            sort: '+order',
            expand: 'products'
        })
        storeSections.set(resp);
    }
    return {
        sections: get(storeSections)
    }
}