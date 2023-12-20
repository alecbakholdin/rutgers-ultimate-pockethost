<script lang="ts">
  let clazz: string | undefined = undefined
  export { clazz as class }

  let open = false
  let summaryEl: HTMLElement
</script>

<svelte:window on:click={(e) => e.target !== summaryEl && (open = false)} />

<details class="hide-arrow relative h-fit" bind:open>
  <summary class="cursor-pointer" bind:this={summaryEl}>
    <slot name="trigger" />
  </summary>
  <ul
    class="absolute top-[100%] z-[1] rounded-b-md rounded-t-none bg-base-100 shadow-xl {clazz}"
  >
    <slot />
  </ul>
</details>

<style>
  .hide-arrow > summary {
    list-style: none;
  }
  .hide-arrow summary::-webkit-details-marker {
    display: none;
  }
</style>
