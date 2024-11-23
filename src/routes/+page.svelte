<script lang="ts">
  import BannerText from '$lib/component/BannerText.svelte'
  import { pb } from '$lib/pocketbase/pb.js'
  import type { TeamResponse } from '$lib/pocketbase/pocketbase-types.js'
  import Icon from '@iconify/svelte'
  export let data
  import PromotionBanner from '$lib/component/PromotionBanner.svelte'

  //declare default variables for promo banner
  const defaultPromoBannerProps = {
    title: 'Welcome to Rutgers Ultimate!',
    description: 'Machine and Nightshade represent Rutgers U',
    buttonText: '',
    buttonLink: '',
    imageUrl: '/promo-picture-anniversary.jpg',
    imageAlt: 'machine-nightshade',
    useCarousel: false,
  }

  //declare store promo banner variables
  const storePromoBannerProps = {
    title: 'New Gear!',
    description: 'Explore our new store and show your support for the team',
    buttonText: 'Shop Now',
    buttonLink: '/store',
    imageUrl: '/big-store.png',
    imageAlt: 'new merch collection',
    useCarousel: true,
  }

  type Link = {
    title: string
    href: string
    imageUrl?: string
    icon?: string
  }
  $: links = getLinks(data.teams, data.storeSections.length)
  function getLinks(teams: TeamResponse[], numStoreSections: number): Link[] {
    const links: Link[] = teams.map((team) => ({
      title: team.name,
      href: `/${team.slug}`,
      imageUrl: pb.getFileUrl(team, team.landing_page_img),
    }))
    return links
  }
</script>

<svelte:head>
  <title>Ultimate</title>
</svelte:head>

<div class="component-wrapper mx-auto flex flex-col items-center">
  <!-- condiitonally render the banner if they're logged in or not -->
  <PromotionBanner
    {...data.storeSections.length
      ? storePromoBannerProps
      : defaultPromoBannerProps}
  />
  <!-- loop through the "links" and divide screen width proportionally -->
  <div class="flex flex-col md:flex-row flex-wrap w-full max-w-5xl mt-4 gap-4">
    {#each links as link (link.href)}
      <div class="flex-1 p-2">
        <a
          href={link.href}
          class="flex items-center justify-center text-white text-3xl font-bold h-64 md:h-80 shadow-lg rounded-lg"
          style="background-image: url({link.imageUrl}); background-size: cover; background-position: center;"
        >
          <div class="bg-black bg-opacity-60 px-4 py-2 rounded-md">
            {link.title}
          </div>
        </a>
      </div>
    {/each}
  </div>

  <style>
    .component-wrapper {
      max-width: 1200px;
      width: 100%;
    }

    a {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 1rem;
    }

    .text-white {
      color: #ffffff;
    }
  </style>
</div>
