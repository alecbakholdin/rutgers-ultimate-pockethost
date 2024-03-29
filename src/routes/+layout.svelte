<script lang="ts">
  import Navbar from '$lib/component/Navbar.svelte'
  import Toasts from '$lib/component/Toasts.svelte'
  import '../app.postcss'
  import GameScore from './[teamSlug]/live/_route/GameScore.svelte'

  import { afterNavigate, beforeNavigate } from '$app/navigation'
  //@ts-ignore
  import { Flip } from 'gsap/dist/Flip'
  //@ts-ignore
  import { gsap } from 'gsap/dist/gsap'
  gsap.registerPlugin(Flip)

  let state: Flip.FlipState
  beforeNavigate(() => {
    state = Flip.getState('.product-image')
  })
  afterNavigate(() => {
    if (!state) return
    Flip.from(state, {
      targets: '.product-image',
      duration: 0.2,
      scale: true,
      ease: 'ease-out',
    })
  })
  export let data
</script>

<div>
  <Navbar />
  {#if data.liveTeams?.length}
    <div class="m-4 flex gap-2">
      {#each data.liveTeams as team}
        {#if team.expand?.live_game}
          <a href="/{team.slug}/live">
            <GameScore {team} game={team.expand.live_game} size={'sm'} />
          </a>
        {/if}
      {/each}
    </div>
  {/if}
  <div class="max-w-5xl mx-auto py-8 px-4">
    <slot />
  </div>
  <Toasts />
</div>
