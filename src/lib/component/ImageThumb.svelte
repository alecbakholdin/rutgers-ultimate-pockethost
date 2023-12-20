<script lang="ts">
  import { pb } from '$lib/pocketbase/pb'
  import Icon from '@iconify/svelte'
  import { rule } from 'postcss'

  interface $$Props {
    size?: number
    record: any
    alt: string
    image: string | undefined
    class?: string | undefined
  }

  export let record: any
  export let alt: string
  export let size: number | undefined = undefined
  export let image: string | undefined
  let clazz: string | undefined = undefined
  export { clazz as class }

  $: url =
    image &&
    pb.getFileUrl(
      record,
      image,
      size !== undefined ? { thumb: `${size}x${size}f` } : undefined,
    )

  let status: 'loading' | 'success' | 'failure' | undefined
  $: if (url && typeof window !== 'undefined') {
    const img = new Image()
    img.src = url
    const timeout = setTimeout(() => (status = 'loading'), 25)

    img.onload = () => {
      clearTimeout(timeout)
      status = 'success'
    }
    img.onerror = () => {
      clearTimeout(timeout)
      status = 'failure'
    }
  }
</script>

{#if url}
  {#if status === 'success' || status === undefined}
    <img
      src={url}
      {alt}
      class={clazz}
      style:width="{size}px"
      style:height="{size}px"
      style:object-fit="scale-down"
    />
  {:else if status === 'loading'}
    <div class={clazz}>
      <div class="w-full h-full grid place-items-center text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
            opacity=".5"
          />
          <path
            fill="currentColor"
            d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
          >
            <animateTransform
              attributeName="transform"
              dur="1s"
              from="0 12 12"
              repeatCount="indefinite"
              to="360 12 12"
              type="rotate"
            />
          </path>
        </svg>
      </div>
    </div>
  {:else if status === 'failure'}
    <div class={clazz}>
      <div class="w-full h-full grid place-items-center text-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 17q.425 0 .713-.288T13 16q0-.425-.288-.712T12 15q-.425 0-.712.288T11 16q0 .425.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22"
          />
        </svg>
      </div>
    </div>
    <img
      src={url}
      {alt}
      class={clazz}
      style:width="{size}px"
      style:height="{size}px"
      style:object-fit="scale-down"
    />
  {/if}
{:else}
  <div
    class="skeleton {clazz}"
    style:width="{size}px"
    style:height="{size}px"
  ></div>
{/if}
