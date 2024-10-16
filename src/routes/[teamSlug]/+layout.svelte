<script lang="ts">
  import { page } from '$app/stores'
  import Icon from '@iconify/svelte'

  $: routeParts = $page.route.id?.split('/').slice(1) || []
  $: params = Object.entries($page.params ?? {}) as [string, string][]
  $: getCrumbText = (part: string) =>
    params.reduce((a, [key, val]) => a.replace(`[${key}]`, val), part)

  export let data
</script>

<div>
  {#if data.team?.archived}
    <div role="alert" class="alert">
      <Icon icon="ri:archive-line" class="text-xl" />
      <span>
        This team has been archived and is no longer active, but stats are still
        viewable. Navigate to the <a href="/" class="underline"> home page </a>
        to see the currently active team(s).
      </span>
    </div>
  {/if}
  <div class="text-sm breadcrumbs">
    <ul>
      <li><a href="/"><Icon icon="mdi:home" /></a></li>
      {#each routeParts as part, i}
        <li>
          {#if i === routeParts.length - 1}
            {getCrumbText(part)}
          {:else}
            <a
              href="/{routeParts
                .slice(0, i + 1)
                .map(getCrumbText)
                .join('/')}"
            >
              {getCrumbText(part)}
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
  <slot />
</div>
