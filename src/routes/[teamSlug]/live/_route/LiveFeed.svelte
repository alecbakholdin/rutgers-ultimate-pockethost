<script lang="ts">
  import _ from 'lodash'
  import LiveEvent from './LiveEvent.svelte'
  import { getLiveGameContext } from './gamePointType'

  const { gamePoints, game, team } = getLiveGameContext()
    /* type LiveFeedEvent = {
        type: LiveEvent['$$prop_def']['type']
        time: LiveEvent['$$prop_def']['time']
    }
  $gamePoints.flatMap(point => {
    
  }) */
</script>

<div class="max-w-md mx-auto flex flex-col gap-2 mt-12">
  {#each $gamePoints || [] as point (point.id)}
    {#if point.expand?.goal && point.expand?.assist}
      <LiveEvent type="success">
        <span>{$team?.name} {point.type === 'D' ? 'Break' : 'Hold'}</span>
        <p slot="body">
          <b>{point.expand?.goal.name}</b> scores with an assist from
          <b>{point.expand?.assist.name}</b>
        </p>
      </LiveEvent>
    {/if}
    {#if point.opponent_goal}
      <LiveEvent type="error">
        <span>{$game?.opponent} {point.type === 'D' ? 'Hold' : 'Break'}</span>
      </LiveEvent>
    {/if}
    {#each _.sortBy(
        point.expand?.['game_point_event(game_point)'] ?? [],
        'created',
      ).reverse() as event}
      {#if ['Drop', 'Turn', 'Block'].includes(event.type)}
        <LiveEvent
          type={event.type === 'Block' ||
          (event.type === 'Turn' && event.opponent)
            ? 'info'
            : 'warning'}
          time={event.created}
        >
          {event.opponent ? $game?.opponent : $team?.name}
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
      <LiveEvent type="neutral" time={point.created}>
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
