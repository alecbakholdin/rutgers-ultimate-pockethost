<script lang="ts">
  import { pb } from '$lib/pocketbase/pb'

  interface $$Props {
    size: number;
    record: any;
    alt: string;
    image: string | undefined;
    class?: string | undefined;
  }

  export let size: number
  export let record: any
  export let alt: string
  export let image: string | undefined
  let clazz: string | undefined = undefined;
  export { clazz as class }

  $: url =
    image &&
    pb.getFileUrl(
      record,
      image,
      size !== undefined ? { thumb: `${size}x${size}f` } : undefined,
    )
</script>

{#if url}
  <img
    class={clazz}
    src={url}
    {alt}
    style:widht="{size}px"
    style:height="{size}px"
  />
{:else}
  <div
    class="skeleton {clazz}"
    style:width="{size}px"
    style:height="{size}px"
  ></div>
{/if}
