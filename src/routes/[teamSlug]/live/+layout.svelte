<script lang="ts">
  import { initLiveGameContext } from './_route/gamePointType.js'

  export let data
  const { team, game } = initLiveGameContext(data.team)
</script>

{#if $game}
  <div class="w-full h-12 grid place-items-center">
    <div class="max-w-screen-sm flex justify-center items-center gap-2">
      <span
        class="text-success text-xl sm:text-3xl font-semibold w-[30%] mr-3 text-right overflow-ellipsis"
      >
        {$team?.name}
      </span>
      <span class="text-success text-6xl font-semibold text-right w-[16%]">
        {$game.team_score}
      </span>
      <span class="text-6xl font-bold mb-2 text-gray-400 text-center">-</span>
      <span class="text-error text-6xl font-semibold w-[16%]">
        {$game.opponent_score}
      </span>
      <span
        class="text-error text-xl sm:text-3xl font-semibold w-[30%] overflow-ellipsis"
      >
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
