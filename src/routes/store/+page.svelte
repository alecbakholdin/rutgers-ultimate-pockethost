<script lang="ts">
  import { pb } from '$lib/pocketbase'

  export let data
</script>

{#await data.products.list then list}
  {#each list as product}
    <a
      class="card card-compact shadow-xl bg-base-100 w-fit"
      href="/store/product/{product.id}"
    >
      <figure>
        <img
          src={pb.files.getUrl(product, product.primaryImage, {
            thumb: '200x200',
          })}
          class="w-[200px] h-[200px]"
          alt={product.title}
        />
      </figure>
      <div class="card-body">
        <h4 class="card-title">{product.title}</h4>
      </div>
    </a>
  {/each}
{/await}
