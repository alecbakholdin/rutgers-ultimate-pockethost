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
    state = Flip.getState(
      '.product-image',
    )
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
</script>

<div>
  <Navbar />

  <div class="max-w-5xl mx-auto py-8 px-4">
    <slot />
  </div>
  <Toasts />
</div>
