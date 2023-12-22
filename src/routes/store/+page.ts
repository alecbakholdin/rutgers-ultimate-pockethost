import type { ExpandedStoreSection } from "$lib/pocketbase/derived-pocketbase-types";
import { pb } from "$lib/pocketbase/pb";
import type { ProductResponse, StoreSectionResponse } from "$lib/pocketbase/pocketbase-types";
import { get, writable } from "svelte/store";

type StoreSectionExpanded = StoreSectionResponse<{products: ProductResponse[]}>;
const storeSections = writable<StoreSectionExpanded[]>();

export async function load(){

    if(!get(storeSections)) {
        const resp = await pb.collection('store_section').getFullList<StoreSectionExpanded>({
            filter: 'enabled=true',
            sort: '+order',
            expand: 'products'
        })
        storeSections.set(resp);
    }
    return {
        sections: get(storeSections)
    }
}