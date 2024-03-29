<script lang="ts">
  import GameScore from '../../live/_route/GameScore.svelte'
  import LiveFeed from '../../live/_route/LiveFeed.svelte'
  import { initLiveGameContext } from '../../live/_route/gamePointType'

  export let data
  const { game, gamePoints, team } = initLiveGameContext(data.team, data.game)
</script>

{#if $game && $team}
  <div class="w-full flex justify-center">
    <GameScore game={$game} team={$team} gamePoints={$gamePoints}></GameScore>
  </div>
{/if}
<LiveFeed {game} {gamePoints} {team} />
