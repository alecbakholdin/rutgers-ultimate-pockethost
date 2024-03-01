<script lang="ts">
  import CurrentPoint from './_route/CurrentPoint.svelte'
  import LineCreator from './_route/LineCreator.svelte'

  import LiveFeed from './_route/LiveFeed.svelte'

  const tabs = ['Lines', 'Current Point', 'Feed'] as const
  let activeTab: (typeof tabs)[number] = tabs[0]

  export let data
</script>

{#if data.user.isManager}
  <div class="max-w-xl mx-auto">
    <div class="tabs tabs-boxed mt-8 mb-4">
      {#each tabs as tab}
        <button
          type="button"
          id={tab}
          aria-label={tab}
          role="tab"
          class="tab"
          class:tab-active={activeTab === tab}
          on:click={() => (activeTab = tab)}
        >
          {tab}
        </button>
      {/each}
    </div>
    {#if activeTab === 'Lines'}
      <LineCreator on:startPoint={() => (activeTab = 'Current Point')} />
    {:else if activeTab === 'Current Point'}
      <CurrentPoint on:pointOver={() => (activeTab = 'Lines')} />
    {:else if activeTab === 'Feed'}
      <LiveFeed />
    {/if}
  </div>
{:else}
  <LiveFeed />
{/if}
