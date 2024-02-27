<script lang="ts">
  import {
      initLiveGameContext
  } from './_route/gamePointType.js'

  export let data
  const { game } = initLiveGameContext(data.team)
</script>

{#if $game}
  <div class="w-full h-12 grid place-items-center">
    <div class="flex justify-center items-center gap-2">
      <span class="text-success text-3xl font-semibold w-32 text-right">
        {data.team.name}
      </span>
      <span class="text-success text-6xl font-semibold text-right w-16">
        {$game.team_score}
      </span>
      <span class="text-6xl font-bold mb-2 text-gray-400 text-center">-</span>
      <span class="text-error text-6xl font-semibold w-16">
        {$game.opponent_score}
      </span>
      <span class="text-error text-3xl font-semibold w-32">
        {$game.opponent}
      </span>
    </div>
  </div>
  <slot />
{:else}
  <div class="max-w-md mt-12 align-center">
    No live game right now. Please check back later.
  </div>
{/if}
