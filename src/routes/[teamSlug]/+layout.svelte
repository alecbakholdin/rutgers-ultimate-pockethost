<script lang="ts">
  import { page } from '$app/stores'
  import Icon from '@iconify/svelte'

  $: routeParts = $page.route.id?.split('/').slice(1) || []
  $: params = Object.entries($page.params ?? {}) as [string, string][]
  $: getCrumbText = (part: string) =>
    params.reduce((a, [key, val]) => a.replace(`[${key}]`, val), part)
</script>

<div>
  <div class="text-sm breadcrumbs">
    <ul>
      <li><a href="/"><Icon icon="mdi:home" /></a></li>
      {#each routeParts as part, i}
        <li>
          {#if i === routeParts.length - 1}
            {getCrumbText(part)}
          {:else}
            <a href="/{routeParts.slice(0, i + 1).map(getCrumbText).join('/')}">
              {getCrumbText(part)}
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
  <slot />
</div>
