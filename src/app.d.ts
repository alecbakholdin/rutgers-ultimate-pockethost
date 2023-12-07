// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  // interface Error {}
  interface Locals {
    pb: import('./lib/pocketbase/pocketbase-types').TypedPocketBase
    user: import('./lib/pocketbase/pocketbase-types').UsersResponse
  }
  // interface PageData {}
  // interface Platform {}
}
