<script lang="ts">
  import Navbar from '$lib/component/Navbar.svelte'
  import Toasts from '$lib/component/Toasts.svelte'
  import '../app.postcss'
</script>

<div>
  <Navbar />

  <div class="max-w-5xl mx-auto py-8 px-4">
    <slot />
  </div>
  <Toasts/>
</div>
