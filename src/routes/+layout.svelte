<script lang="ts">
  import Navbar from '$lib/component/Navbar.svelte'
  import Toasts from '$lib/component/Toasts.svelte'
  import '../app.postcss'

  import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation'
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
    <div class="m-4">
      <div><span>Live Games</span></div>
      <div class="flex gap-1 mt-2">
        {#each data.liveTeams as team}
          {@const game = team.expand?.live_game}
          <a href="/{team.slug}/live" class="card card-compact card-bordered">
            <div class="card-body grid grid-cols-[1fr_auto_1fr]">
              <span class="text-right">{team.name}</span>
              <span class="text-center">vs.</span>
              <span class="text-left">{game?.opponent}</span>
              <span class="col-span-full grid gap-3 grid-cols-[1fr_auto_1fr]">
                <span class="text-right">{game?.team_score}</span>
                <span>:</span>
                <span class="text-left">{game?.opponent_score}</span>
              </span>
              <span class="col-span-full text-center">{game?.status}</span>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}
  <div class="max-w-5xl mx-auto py-8 px-4">
    <slot />
  </div>
  <Toasts />
</div>
