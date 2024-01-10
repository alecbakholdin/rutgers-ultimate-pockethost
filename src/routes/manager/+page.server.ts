import {redirect} from '@sveltejs/kit';
import { adminPages } from './+layout.svelte';

export async function load() {
    
    throw redirect(308, `/manager${adminPages[0].path}`);
}