import { fullOrderResponseExpansionString, type FullOrderResponse } from '$lib/pocketbase/derived-pocketbase-types.js';
import { pb } from '$lib/pocketbase/pb';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const order = await pb.collection('order').getOne<FullOrderResponse>(params.orderId, { expand: fullOrderResponseExpansionString })
    if (!order) throw error(404, { message: "Order not found" });
    return {
        order
    }
}