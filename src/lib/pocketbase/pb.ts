import { PUBLIC_POCKETBASE_URL } from '$env/static/public'
import PocketBase from 'pocketbase'
import { writable } from 'svelte/store'
import type { UsersResponse, TypedPocketBase } from './pocketbase-types'
import dateFormat from 'dateformat'

export const pb = new PocketBase(PUBLIC_POCKETBASE_URL).autoCancellation(
  false,
) as TypedPocketBase

export const currentUser = writable<UsersResponse | undefined>(
  pb.authStore.model as any,
)

export function pbDate(date: Date | string): string {
  return dateFormat(date, "yyyy-mm-dd'T'hh:MM")
}
