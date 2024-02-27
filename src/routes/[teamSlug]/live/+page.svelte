<script lang="ts">
  import { pb } from '$lib/pocketbase/pb'
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import LiveEvent from './_route/LiveEvent.svelte'
  import type {
    GamePointResponse,
    GamePointEventResponse,
    PlayerResponse,
  } from '$lib/pocketbase/pocketbase-types'
  import _ from 'lodash'
  import { getLiveGameContext, getPoint, type LiveFeedGamePoint } from './_route/gamePointType'

  export let data

  let toggle = false
  const {gamePoints, game, team} = getLiveGameContext()
</script>

<div class="max-w-md mx-auto flex flex-col gap-2 mt-12">
  {#each $gamePoints || [] as point (point.id)}
    {#if point.expand?.goal && point.expand?.assist}
      <LiveEvent type="success">
        <b>{$team?.name}</b>{point.type === 'D' ? 'Break' : 'Hold'}
        <p slot="body">
          <b>{point.expand?.goal.name}</b> scores with an assist from
          <b>{point.expand?.assist.name}</b>
        </p>
      </LiveEvent>
    {/if}
    {#if point.opponent_goal}
      <LiveEvent type="error">
        <b>{$game?.opponent}</b>{point.type === 'D' ? 'Hold' : 'Break'}
      </LiveEvent>
    {/if}
    {#each point.expand?.['game_point_event(game_point)'] ?? [] as event (point.id, event.id)}
      {#if ['Drop', 'Turn', 'Block'].includes(event.type)}
        <LiveEvent type={event.type === 'Block' ? 'info' : 'warning'}>
          <b>{event.opponent ? $game?.opponent : $team?.name}</b>
          {event.type}
          <svelte:fragment slot="body">
            {#if event.type === 'Block' && event.expand?.player}
              <p>
                <b>{event.expand.player.name}</b>
                earned a block!
              </p>
            {/if}
          </svelte:fragment>
        </LiveEvent>
      {/if}
    {/each}
    {#if point.type === 'O' || point.type === 'D'}
      <LiveEvent type="neutral">
        Point start ({point.team_score}-{point.opponent_score})
        <p slot="body">
          <b>{$team?.name}</b> is on {point.type === 'O'
            ? 'offense'
            : 'defense'}
        </p>
      </LiveEvent>
    {:else}
      <LiveEvent
        type={point.team_score > point.opponent_score ? 'success' : 'neutral'}
      >
        Final Score ({point.team_score}-{point.opponent_score})
        <p slot="body">
          {#if point.team_score > point.opponent_score}
            <b>{$team?.name}</b> wins!
          {:else}
            <b>{$team?.name}</b> loses
          {/if}
        </p>
      </LiveEvent>
    {/if}
  {/each}
</div>
