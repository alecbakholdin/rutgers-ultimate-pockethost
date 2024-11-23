declare module 'svelte-skeleton/Skeleton.svelte' {
  import { SvelteComponentTyped } from 'svelte'

  export default class Skeleton extends SvelteComponentTyped<{
    height?: string | number
    width?: string | number
    children?: string
  }> {}
}
