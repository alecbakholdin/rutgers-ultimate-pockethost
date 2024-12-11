<script lang="ts">
  import { onMount } from 'svelte'
  import { pb, currentUser } from '$lib/pocketbase/pb.js'
  import Skeleton from 'svelte-skeleton/Skeleton.svelte'
  import { get } from 'svelte/store'
  import type {
    ProductResponse,
    StoreSectionResponse,
  } from '$lib/pocketbase/pocketbase-types'

  type StoreSectionExpanded = StoreSectionResponse<{
    products: ProductResponse[]
  }>

  let isLoading = true
  let interval: any
  let index: number = 0

  //we just want primary image and link url
  type ProductData = {
    imageUrl: string
    linkUrl: string
  }

  let productArr: ProductData[]

  export async function load() {
    //get current user id
    const userId = get(currentUser)?.id

    //check if user id exists in allow_preview or in team_groups
    const filter = userId
      ? pb.filter('enabled = true || allow_preview ~ {:userId}', { userId })
      : 'enabled = true'

    //get full list of products according to this filter, returns jsonified format
    const resp = await pb
      .collection('store_section')
      .getFullList<StoreSectionExpanded>({
        filter,
        expand: 'products',
      })

    //set our productArr to be an array of objects with imageUrl and linkUrl, as we flatmapped resp
    productArr = resp.flatMap((section) =>
      (section.expand?.products ?? []).map((product) => ({
        imageUrl: pb.getFileUrl(product, product.primaryImage),
        linkUrl: '/store/product/' + product.slug,
      })),
    )
    //shuffle productArr on each load  using Fisher-Yates shuffle algorithm
    productArr = shuffleArray(productArr)

    //remove skeleton loader b/c data is ready
    isLoading = false
  }

  function shuffleArray(array: ProductData[]): ProductData[] {
    for (let i = array.length - 1; i > 0; i--) {
      //random index
      const j = Math.floor(Math.random() * (i + 1))
      // Swap elements
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  //logic for carousel indexing
  function nextSlide() {
    // if we're on last index, then wait 2.5sec before going to start
    if (index == productArr.length - 1) {
      setTimeout(() => {
        index = 0
      }, 2500)
    } else {
      index = (index + 1) % productArr.length
    }
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
