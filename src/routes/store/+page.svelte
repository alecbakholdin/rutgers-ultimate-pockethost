<script lang="ts">
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  import { pb } from '$lib/pocketbase/pb.js'

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
          <p>${(product.priceInCents / 100).toFixed(2)}</p>
        </div>
      </a>
    {/each}
  </div>
{/await}
