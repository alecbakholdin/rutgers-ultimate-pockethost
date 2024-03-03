<script lang="ts">
  import Icon from '@iconify/svelte'
  import { initLiveGameContext } from './_route/gamePointType.js'
  import { GamePointEventTypeOptions, GamePointTypeOptions } from '$lib/pocketbase/pocketbase-types.js'
    import { preview } from 'vite'

  export let data
  const { team, game, ourPossession, gameOver, gamePoints } =
    initLiveGameContext(data.team)
</script>

{#if $game}
  <div class="w-full grid grid-cols-[1fr_auto_1fr]">
    <div class="text-success font-semibold text-right flex items-center flex-row-reverse">
      <span class="text-6xl w-12">
        {$game.team_score}
      </span>
      <span class="text-xl sm:text-3xl mr-3 overflow-ellipsis">
        {$team?.name}
      </span>
        {#if $ourPossession && !$gameOver}
          <Icon
            icon="game-icons:frisbee"
            class="text-gray-400 text-2xl mr-4 mt-1" />
        {/if}
    </div>
    <span class="text-6xl font-bold mb-2 text-gray-400 text-center mx-4">-</span>
    <div class="text-error font-semibold flex items-center">
      <span class="text-6xl min-w-fit w-12">
        {$game.opponent_score}
      </span>
      <span class="text-xl sm:text-3xl overflow-ellipsis">
        {$game.opponent}
      </span>
        {#if !$ourPossession && !$gameOver}
          <Icon
            icon="game-icons:frisbee"
            class="text-gray-400 text-2xl mt-1 ml-4" 
          />
        {/if}
    </div>
  </div>
  <div class="w-full grid place-items-center">
    <div class="w-full flex justify-center items-center gap-2">
      <div class="w-20 text-lg text-success text-right">
        {$gamePoints?.filter((x) => x.type === GamePointTypeOptions.D && x.goal)
          .length}
      </div>
      <span class="text-gray-400 text-center">Breaks</span>
      <div class="w-20 text-lg text-error">
        {$gamePoints?.filter(
          (x) => x.type === GamePointTypeOptions.O && x.opponent_goal,
        ).length}
      </div>
    </div>
    <div class="w-full flex justify-center items-center gap-2">
      <div class="w-20 text-lg text-success text-right">
        {$gamePoints?.reduce((prev, curr) => prev + (curr?.expand?.['game_point_event(game_point)']?.filter(x => x.type === GamePointEventTypeOptions.Turn && !x.opponent)?.length ?? 0), 0)}
        </div>
        <div class="text-gray-400 text-center">Turns</div>
        <div class="w-full flex justify-center items-center gap-2">
          <div class="w-20 text-lg text-error">
        {$gamePoints?.reduce((prev, curr) => prev + (curr?.expand?.['game_point_event(game_point)']?.filter(x => x.type === GamePointEventTypeOptions.Turn && x.opponent)?.length ?? 0), 0)}
      </div>
      </div>
    </div>
    <div class="w-full flex justify-center items-center gap-2">
      <div class="w-20 text-lg text-success text-right">
        {$gamePoints?.reduce((prev, curr) => prev + (curr?.expand?.['game_point_event(game_point)']?.filter(x => x.type === GamePointEventTypeOptions.Drop && !x.opponent)?.length ?? 0), 0)}
        </div>
        <div class="text-gray-400 text-center">Drops</div>
        <div class="w-full flex justify-center items-center gap-2">
          <div class="w-20 text-lg text-error">
        {$gamePoints?.reduce((prev, curr) => prev + (curr?.expand?.['game_point_event(game_point)']?.filter(x => x.type === GamePointEventTypeOptions.Drop && x.opponent)?.length ?? 0), 0)}
      </div>
      </div>
    </div>
    <div class="w-full flex justify-center items-center gap-2">
      <div class="w-20 text-lg text-success text-right">
        {$gamePoints?.reduce((prev, curr) => prev + (curr?.expand?.['game_point_event(game_point)']?.filter(x => x.type === GamePointEventTypeOptions.Block && !x.opponent)?.length ?? 0), 0)}
        </div>
        <div class="text-gray-400 text-center">Blocks</div>
        <div class="w-full flex justify-center items-center gap-2">
          <div class="w-20 text-lg text-error">
        {$gamePoints?.reduce((prev, curr) => prev + (curr?.expand?.['game_point_event(game_point)']?.filter(x => x.type === GamePointEventTypeOptions.Block && x.opponent)?.length ?? 0), 0)}
      </div>
      </div>
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
