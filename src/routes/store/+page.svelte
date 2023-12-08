<script lang="ts">
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  import { pb } from '$lib/pocketbase/pb.js'
    import { formatCents } from '$lib/util/functions/formatCents.js'

  export let data
</script>

{#await data.products.list then list}
  <div class="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-items-center gap-2">
    {#each list as product}
      <a
        class="card card-compact shadow-xl bg-base-100 w-fit"
        href="/store/product/{product.slug}"
      >
        <figure class="w-[200px] h-[200px]">
          <ImageThumb
            image={product.primaryImage}
            record={product}
            size={200}
            alt={product.title}
          />
        </figure>
        <div class="card-body">
          <h4 class="card-title">{product.title}</h4>
          <p>{formatCents(product.priceInCents)}</p>
          {#if product.required_for_team}
            <p class="text-error">* Required for Players</p>
          {/if} 
        </div>
      </a>
    {/each}
  </div>
{/await}
