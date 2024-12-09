<script lang="ts">
  import { onMount } from 'svelte'
  import { pb, currentUser } from '$lib/pocketbase/pb.js'
  import Skeleton from 'svelte-skeleton/Skeleton.svelte'
  import { get } from 'svelte/store'
  import type { StoreSectionResponse } from '$lib/pocketbase/pocketbase-types'

  let isLoading = true

  let interval: any
  let index: number

  //we just want primary image and link url
  type ProductData = {
    imageUrl: string
    linkUrl: string
  }

  let productArr: ProductData[] = []

  export async function load() {
    //get current user id
    const userId = get(currentUser)?.id
    const products: string[] = []

    const productRecs = await pb.collection('product').getFullList({
      sort: '-created',
    })

    //check if user id exists in allow_preview or in team_groups
    //set up filter conditions
    const filter = userId
      ? pb.filter('enabled = true || allow_preview ~ {:userId}', { userId })
      : 'enabled = true'

    //get full list of products according to this filter, returns jsonified format
    const resp = await pb
      .collection('store_section')
      .getFullList<StoreSectionResponse>({
        filter,
        expand: 'products',
      })

    //populate array of products for current user
    resp.forEach((storeSection) => {
      products.push(...storeSection.products)
    })

    //if product id is in avail products for user, then add to productArr
    productRecs.forEach((product) => {
      if (products.includes(product.id)) {
        productArr.push({
          imageUrl: pb.getFileUrl(product, product.primaryImage),
          linkUrl: '/store/product/' + product.slug,
        })
      }
    })
    //randomize index we start on
    index = Math.floor(Math.random() * productArr.length)
    //remove skeleton loader b/c data is ready
    isLoading = false
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
    startSlider()
    load()
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
</style>
