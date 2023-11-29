<script lang="ts">
  import { pb } from '$lib/pocketbase'

  export let size: number
  export let record: any
  export let alt: string
  export let image: string | undefined

  $: url =
    image &&
    pb.getFileUrl(
      record,
      image,
      size !== undefined ? { thumb: `${size}x${size}` } : undefined,
    )
</script>

{#if url}
  <img src={url} {alt} style:widht="{size}px" style:height="{size}px" />
{:else}
  <div class="skeleton" style:width="{size}px" style:height="{size}px"></div>
{/if}
