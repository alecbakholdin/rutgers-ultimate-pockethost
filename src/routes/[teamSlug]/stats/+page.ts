import { pb } from "$lib/pocketbase/pb";

export async function load({ params, url}) {
    
    const filterParams = {
        slug: params.teamSlug,
        startDate: url.searchParams.get('start_date'),
        endDate: url.searchParams.get('end_date')
    }
    const filterString = `team.slug = {:slug}${filterParams.startDate ? ' && created >= {:startDate}' : ''}${filterParams.endDate ? ' && created <= {:endDate}' : ''}`
    const players = pb.collection('player').getFullList({
        filter: pb.filter('team.slug = {:slug}', filterParams)
    });
    const points = pb.collection('game_point').getFullList({
        filter: pb.filter('game.' + filterString, filterParams)
    });
    const pointEvents = pb.collection('game_point_event').getFullList({
        filter: pb.filter('game_point.game.' + filterString, filterParams)
    })
    const [playersResp, pointsResp, pointEventsResp] = await Promise.all([players, points, pointEvents])
    return {
        players: playersResp,
        points: pointsResp,
        pointEvents: pointEventsResp
    }
}