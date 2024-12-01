<script lang="ts">
  import { onMount } from 'svelte'
  import { pb } from '$lib/pocketbase/pb.js'
  import Skeleton from 'svelte-skeleton/Skeleton.svelte'

  let productCollectionRecords: any[] = []
  let isLoading = true
  let index = 0
  let interval: any

  //we just want primary imge and link url
  type ProductData = {
    imageUrl: string
    linkUrl: string
  }

  let productArr: ProductData[] = []

  //fetch from pocket host
  async function fetchProducts() {
    try {
      productCollectionRecords = await pb
        .collection('product')
        .getFullList(200, {
          sort: '-created',
        })
      productArr = getProductData(productCollectionRecords)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      isLoading = false
      //update state for skelton loader
    }
  }

  //get product data, we want global products that only start with r-ulimate. populate prudctArr with objects, where each contaisn image url and link url
  function getProductData(productList: any[]): ProductData[] {
    return productList
      .filter(
        (product) => product.enabled && product.slug.startsWith('r-ultimate'), // Filter by slug prefix
      )
      .map((product) => ({
        imageUrl: pb.getFileUrl(product, product.primaryImage),
        linkUrl: '/store/product/' + product.slug,
      }))
  }

  //logic for carousel indexing
  function nextSlide() {
    index = (index + 1) % productArr.length
  }

  function startSlider() {
    interval = setInterval(nextSlide, 2500)
  }

  function stopSlider() {
    clearInterval(interval)
  }

  onMount(() => {
    fetchProducts()
    startSlider()
    return () => stopSlider()
  })
</script>

{#if isLoading}
  <div class="carousel">
    <Skeleton height="100%" width="100%">
      <rect width="100%" height="100%" rx="8" ry="8" />
    </Skeleton>
  </div>
{:else}
  <div class="carousel">
    <div
      class="image-container"
      style="transform: translateX(calc(-{index} * 100%));"
    >
      {#each productArr as product}
        <a class="image-wrapper" href={product.linkUrl}>
          <img src={product.imageUrl} alt="Product visual" />
        </a>
      {/each}
    </div>
  </div>
{/if}

<style>
  .carousel {
    position: relative;
    width: 100%;
    max-width: 100%;
    max-height: 300px;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-container {
    display: flex;
    transition: transform 0.5s ease-in-out;
    width: 100%;
    height: 100%;
  }

  .image-wrapper {
    flex: 0 0 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .image-wrapper img {
    width: auto;
    height: 100%;
    object-fit: contain;
  }
  .skeleton-loader {
    width: 100%;
    height: 100%;
  }
</style>
