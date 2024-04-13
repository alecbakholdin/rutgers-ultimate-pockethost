<script lang="ts">
  import BannerText from '$lib/component/BannerText.svelte'
  import { pb } from '$lib/pocketbase/pb.js'
  import type { TeamResponse } from '$lib/pocketbase/pocketbase-types.js'
  import Icon from '@iconify/svelte'
  export let data

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
      imageUrl: pb.getFileUrl(team, team.logo),
    }))
    if (numStoreSections) {
      links.push({ title: 'Store', href: "/store", icon: 'material-symbols:store' })
    }
    return links
  }
</script>

<svelte:head>
  <title>Ultimate</title>
</svelte:head>

<BannerText text={'Welcome to Rutgers Ultimate! Check out the pages below'} />
<div class="max-w-md mx-auto flex gap-2 items-center">
  {#await Promise.all([data.teams, data.storeSections])}
    <div class="loading loading-lg text-primary mx-auto"></div>
  {:then}
    <div class="flex gap-2 mx-auto">
      {#each links as link}
        <div class="card card-bordered border-primary">
          <a class="card-body flex items-center justify-center" href={link.href} >
            {#if link.imageUrl}
              <img src={link.imageUrl} alt={link.title} class="h-12 w-12" />
            {:else if link.icon}
              <Icon icon={link.icon} />
            {/if}
            <span class="text-xl text-primary">{link.title}</span>
          </a>
        </div>
      {/each}
    </div>
  {/await}
</div>
