<script lang="ts">
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  
  export let data

  let currentImage = data.product.primaryImage
</script>

{#await data.product then product}
  <div class="flex flex-col">
    <div class="w-[480px]" style:width="480px">
      <div class="rounded-md overflow-hidden">
        <ImageThumb
          record={product}
          image={currentImage}
          alt={product.title}
          size={480}
        />
      </div>
      <div class="w-full overflow-x-auto flex mt-2">
          {#each [product.primaryImage,product.primaryImage,product.primaryImage,product.primaryImage, ...product.galleryImages].filter((x) => x) as image, i}
            <button
              type="button"
              on:click={() => (currentImage = image)}
              class="border-4 rounded-md border-transparent flex-shrink-0"
              class:border-primary={image === currentImage}
            >
              <ImageThumb
                record={product}
                {image}
                alt="{product.title}-{i}"
                size={120}
              />
            </button>
          {/each}
      </div>
    </div>

    <div class="w-full flex flex-col items-end">
      <h2>{product.title}</h2>
    </div>
  </div>
{/await}
