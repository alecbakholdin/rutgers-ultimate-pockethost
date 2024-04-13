import { pb } from "$lib/pocketbase/pb";

export async function load({parent}) {
    const {user} = await parent()
    const filterStr = "enabled = true" + (user ? " || allow_preview ~ {:userId}" : "")
    const storeSections = pb.collection('store_section').getFullList({
        filter: pb.filter(filterStr, {userId: user?.id || ""})
    })
    const teams = pb.collection('team').getFullList()
    return {
        teams,
        storeSections
    }
}