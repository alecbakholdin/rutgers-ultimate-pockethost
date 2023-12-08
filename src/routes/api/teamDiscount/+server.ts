import { TEAM_DISCOUNT_CODE } from '$env/static/private';
import { error, json } from '@sveltejs/kit';

export async function GET({ url, locals: {user} }) {
    if(!user) throw error(401, {message: "Unauthenticated"})

    const code = url.searchParams.get('code');
    if (!code) throw error(400, { message: "Missing query search parameter 'code'" })
    if (code !== TEAM_DISCOUNT_CODE) throw error(400, { message: "Invalid code" })
    return json({ message: 'OK' })
}