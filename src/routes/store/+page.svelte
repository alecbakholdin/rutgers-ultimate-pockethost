<script lang="ts">
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  import { formatCents } from '$lib/util/functions/formatCents.js'

  export let data
</script>

{#await data.products.list then list}
  <div class="mx-auto grid grid-cols-2 md:grid-cols-3 place-items-center gap-2">
    {#each list as product}
      <a class="w-fit" href="/store/product/{product.slug}">
        <figure class="w-full aspect-square">
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
{/await}
