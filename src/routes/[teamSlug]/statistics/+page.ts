import { pb } from "$lib/pocketbase/pb";

export async function load({ params, url}) {
    
    const filterParams = {
        slug: params.teamSlug,
        startDate: url.searchParams.get('start_date'),
        endDate: url.searchParams.get('end_date'),
        game: url.searchParams.get('game')
    }
    filterParams.endDate = filterParams.endDate && filterParams.endDate + ' 23:59:59'
    const filterString = `team.slug = {:slug}${filterParams.startDate ? ' && created >= {:startDate}' : ''}${filterParams.endDate ? ' && created <= {:endDate}' : ''}`
    const gameString = (prefix : string) => filterParams.game ? ` && ${prefix}game = {:game}` : ''
    const players = pb.collection('player').getFullList({
        filter: pb.filter('team.slug = {:slug}', filterParams)
    }).catch(console.error);
    const points = pb.collection('game_point').getFullList({
        filter: pb.filter('game.' + filterString + gameString(''), filterParams)
    }).catch(console.error);
    const pointEvents = pb.collection('game_point_event').getFullList({
        filter: pb.filter('game_point.game.' + filterString + gameString('game_point.'), filterParams)
    }).catch(console.error)
    const [playersResp, pointsResp, pointEventsResp] = await Promise.all([players, points, pointEvents])
    return {
        players: playersResp,
        points: pointsResp,
        pointEvents: pointEventsResp
    }
}