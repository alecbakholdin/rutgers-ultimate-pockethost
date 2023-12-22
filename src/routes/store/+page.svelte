<script lang="ts">
  import DebugObject from '$lib/component/DebugObject.svelte'
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  import { formatCents } from '$lib/util/functions/formatCents.js'

  export let data
</script>

{#each data.sections as section}
  <div class="divider mt-16 first:mt-0">{section.title}</div>
  <div class="mx-auto grid grid-cols-2 md:grid-cols-3 place-items-center gap-2">
    {#each section.expand?.products ?? [] as product}
      <a class="w-fit" href="/store/product/{product.slug}">
        <figure
          class="product-image"
          data-flip-id="product-image-{product.primaryImage}"
        >
          <ImageThumb
            image={product.primaryImage}
            record={product}
            alt={product.title}
            class="w-[200px] h-[200px]"
          />
        </figure>

        <h4 class="font-semibold text-lg">{product.title}</h4>
        <p>{formatCents(product.priceInCents)}</p>
        {#if product.requiredForPlayers}
          <p class="text-error">* Required for Players</p>
        {/if}
      </a>
    {/each}
  </div>
{/each}
