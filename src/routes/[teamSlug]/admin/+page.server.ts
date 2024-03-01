import { redirect } from '@sveltejs/kit';


export async function load({params, locals: {user}}) {
    if(!user?.isManager) {
        throw redirect(303, `/${params.teamSlug}/live`)
    }
}