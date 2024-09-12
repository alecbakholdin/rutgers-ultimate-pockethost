<script lang="ts">
  import _ from 'lodash'
  import LiveEvent from './LiveEvent.svelte'
  import type { LiveGameContext } from './gamePointType'
  import { message } from 'sveltekit-superforms/server'

  export let gamePoints: LiveGameContext['gamePoints']
  export let game: LiveGameContext['game']
  export let team: LiveGameContext['team']
</script>

<div class="max-w-md mx-auto flex flex-col gap-2 mt-12">
  {#each $gamePoints || [] as point (point.id)}
    {#if point.expand?.goal && point.expand?.assist}
      {#if point.goal === point.assist}
        <LiveEvent type="success" time={point.end}>
          <span>{$team?.name} Callahan!</span>
          <p slot="body"><b>{point.expand.goal.name}</b> Scored a Callahan!</p>
        </LiveEvent>
      {:else}
        <LiveEvent type="success" time={point.end}>
          <span>{$team?.name} {point.type === 'D' ? 'Break' : 'Hold'}</span>
          <p slot="body">
            <b>{point.expand?.goal.name}</b> scores with an assist from
            <b>{point.expand?.assist.name}</b>
          </p>
        </LiveEvent>
      {/if}
    {/if}
    {#if point.opponent_goal}
      <LiveEvent type="error" time={point.end}>
        <span>{$game?.opponent} {point.type === 'D' ? 'Hold' : 'Break'}</span>
      </LiveEvent>
    {/if}
    {#each _.sortBy(point.expand?.['game_point_event(game_point)'] ?? [], 'created').reverse() as event}
      {#if ['Drop', 'Turn', 'Block'].includes(event.type)}
        <LiveEvent
          type={event.type === 'Block' ||
          (['Turn', 'Drop'].includes(event.type) && event.opponent)
            ? 'info'
            : 'warning'}
          time={event.created}
        >
          {event.opponent ? $game?.opponent : $team?.name}
          {event.type}
          <svelte:fragment slot="body">
            {#if event.expand?.player}
              <p>
                <b>{event.expand.player.name}</b>
                {#if event.message}
                  {event.message}
                {:else if event.type === 'Block'}
                  earned a block!
                {:else if event.type === 'Drop'}
                  dropped it
                {:else if event.type === 'Turn'}
                  turned it
                {/if}
              </p>
            {/if}
          </svelte:fragment>
        </LiveEvent>
      {:else if event.type === 'TeamTimeout'}
        <LiveEvent type={'neutral'} time={event.created}
          >{$team?.name ?? 'Our'} Timeout</LiveEvent
        >
      {:else if event.type === 'OpponentTimeout'}
        <LiveEvent type={'neutral'} time={event.created}
          >{$game?.opponent ?? 'Their'} Timeout</LiveEvent
        >
      {/if}
    {/each}
    {#if point.type === 'O' || point.type === 'D'}
      <LiveEvent type="neutral" time={point.created}>
        Point start ({point.team_score}-{point.opponent_score})
        <p slot="body">
          <b>{$team?.name}</b> is on {point.type === 'O'
            ? 'offense'
            : 'defense'}
        </p>
      </LiveEvent>
    {:else if point.type === 'Half'}
      <LiveEvent type={'neutral'} time={point.created}>Halftime</LiveEvent>
    {:else if point.type === 'TeamTimeout'}
      <LiveEvent type={'neutral'} time={point.created}
        >{$team?.name ?? 'Our'} Timeout</LiveEvent
      >
    {:else if point.type === 'OpponentTimeout'}
      <LiveEvent type={'neutral'} time={point.created}
        >{$game?.opponent ?? 'Their'} Timeout</LiveEvent
      >
    {:else if point.type === 'Final'}
      <LiveEvent
        type={point.team_score > point.opponent_score ? 'success' : 'neutral'}
        time={point.created}
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
