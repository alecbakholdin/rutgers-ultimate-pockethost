<script lang="ts">
  import BannerText from '$lib/component/BannerText.svelte'
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  import { getUnitPrice } from '$lib/util/functions/cartUtils.js'
  import { formatCents } from '$lib/util/functions/formatCents.js'
  import _ from 'lodash'

  export let data
</script>

<svelte:head>
  <title>Ultimate Store</title>
</svelte:head>

{#each data.sections as section}
  <div class="divider mt-16 first:mt-0 text-gray-400">{section.title}</div>
  <div
    class="mx-auto grid grid-cols-2 md:grid-cols-3 place-items-center gap-2 max-w-[95vw]"
  >
    {#each _.sortBy(section.expand?.products ?? [], 'title') as product}
      <a class="max-w-[250px]" href="/store/product/{product.slug}">
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
        <p>{formatCents(getUnitPrice(product))}</p>
        {#if product.requiredForPlayers}
          <p class="text-error">* Required for Players</p>
        {/if}
      </a>
    {/each}
  </div>
{:else}
  <BannerText
    text={"We don't have anything to sell right now, but please check back later!"}
  />
{/each}
