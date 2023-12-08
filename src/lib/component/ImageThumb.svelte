<script lang="ts">
  import { pb } from '$lib/pocketbase/pb'

  interface $$Props {
    size?: number;
    record: any;
    alt: string;
    image: string | undefined;
    class?: string | undefined;
  }

  export let record: any
  export let alt: string
  export let size: number | undefined = undefined;
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
    src={url}
    {alt}
    class={clazz}
    style:width="{size}px"
    style:height="{size}px"
    style:object-fit="scale-down"
  />
{:else}
  <div
    class="skeleton {clazz}"
    style:width="{size}px"
    style:height="{size}px"
  ></div>
{/if}
