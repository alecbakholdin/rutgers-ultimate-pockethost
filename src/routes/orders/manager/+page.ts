import { pb } from '$lib/pocketbase/pb.js';

export async function load({ url: {searchParams} }) {
    const page = parseInt(searchParams.get('page') ?? '0');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10')
    const sortBy = searchParams.get('sortBy')

    return {
        orders: await pb.collection('order').getList(page, pageSize, {
            ...(sortBy && {sort: sortBy}),
        })
    }
}