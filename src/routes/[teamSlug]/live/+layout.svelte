<script lang="ts">
  import Icon from '@iconify/svelte'
  import { initLiveGameContext } from './_route/gamePointType.js'
  import {
    GamePointEventTypeOptions,
    GamePointTypeOptions,
  } from '$lib/pocketbase/pocketbase-types.js'
  import GameScore from './_route/GameScore.svelte'

  export let data
  const { team, game, ourPossession, gameOver, gamePoints } =
    initLiveGameContext(data.team)
</script>

{#if $game && $team}
  <div class="w-full mx-auto flex justify-center">
    <GameScore team={$team} game={$game} gamePoints={$gamePoints} />
  </div>
  <slot />
{:else}
  <div class="max-w-md mt-12 align-center">
    No live game right now. Please check back later.
  </div>
{/if}
