import { fullOrderResponseExpansionString, type FullOrderResponse } from '$lib/pocketbase/derived-pocketbase-types.js';
import { pb } from '$lib/pocketbase/pb.js';

export async function load({ url: { searchParams } }) {
    const page = parseInt(searchParams.get('page') ?? '0');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10');
    const sortBy = searchParams.get('sortBy');
    const search = searchParams.get('search');

    return {
        orders: await pb.collection('order').getList<FullOrderResponse>(page, pageSize, {
            ...(sortBy && { sort: sortBy }),
            ...(search && { filter: pb.filter("(user.name ~ {:search} || user.email ~ {:search})", { search }) }),
            expand: fullOrderResponseExpansionString
        }),
        search,
        page,
        pageSize,
        sortBy
    }
}