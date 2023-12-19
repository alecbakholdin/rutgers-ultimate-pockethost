import { error } from '@sveltejs/kit';

export async function load({locals: {user}}) {
    if(!user?.isManager) throw error(404, {message: "Not Found"})
    
    return {
        
    }
}