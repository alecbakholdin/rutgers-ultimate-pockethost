import { PUBLIC_POCKETBASE_URL } from '$env/static/public'
import PocketBase from 'pocketbase'
import { writable } from 'svelte/store'
import type { UsersResponse, TypedPocketBase } from './pocketbase-types'

export const pb = new PocketBase(PUBLIC_POCKETBASE_URL) as TypedPocketBase

export const currentUser = writable<UsersResponse | undefined>(
  pb.authStore.model as any,
)
