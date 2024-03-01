<script lang="ts">
  import Icon from '@iconify/svelte'
  import { initLiveGameContext } from './_route/gamePointType.js'

  export let data
  const { team, game, ourPossession, gameOver } = initLiveGameContext(data.team)
</script>

{#if $game}
  <div class="w-full grid place-items-center">
    <div class="max-w-screen-sm flex justify-center items-center gap-2">
      <span
        class="relative text-success text-xl sm:text-3xl font-semibold w-[30%] mr-3 text-right overflow-ellipsis"
      >
        {#if $ourPossession && !$gameOver}
          <Icon
            icon="game-icons:frisbee"
            class="text-lg absolute left-0 -translate-x-full top-1/2 -translate-y-1/2"
          />
        {/if}
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
        class="relative text-error text-xl sm:text-3xl font-semibold w-[30%] overflow-ellipsis flex items-center"
      >
        {$game.opponent}
        {#if !$ourPossession && !$gameOver}
          <Icon
            icon="game-icons:frisbee"
            class="text-lg absolute right-0 translate-x-full  top-1/2 -translate-y-1/2"
          />
        {/if}
      </span>
    </div>
    {#if $gameOver}
      <div class="flex justify-center">
        <span class="text-neutral">Final</span>
      </div>
    {/if}
  </div>
  <slot />
{:else}
  <div class="max-w-md mt-12 align-center">
    No live game right now. Please check back later.
  </div>
{/if}
