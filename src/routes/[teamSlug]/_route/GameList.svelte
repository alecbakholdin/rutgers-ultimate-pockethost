<script lang="ts">
  import type {
      GameResponse,
      TeamResponse,
  } from '$lib/pocketbase/pocketbase-types'
  import GameCard from './GameCard.svelte'

  export let team: TeamResponse<{ 'game(team)': GameResponse[] }>
  export let openModal: ((game: GameResponse) => void) | undefined = undefined

  $: teamGames = team.expand?.['game(team)'] || []
  $: liveGame = teamGames.find((x) => x.id === team.live_game)
  $: finishedGames = teamGames.filter((x) => x.end)
  $: scheduledGames = teamGames.filter((x) => x.id !== liveGame?.id && !x.end)

  function contextMenuHandler(game: GameResponse) {
    return function (e: MouseEvent) {
      if (openModal) {
        e.preventDefault()
        e.stopPropagation()
        openModal(game)
      }
    }
  }
</script>

{#if liveGame}
  <div class="my-2">
    <p class="text-lg font-semibold">Live Game</p>
    <div on:contextmenu={contextMenuHandler(liveGame)} role="article">
      <GameCard {team} game={liveGame} href="/{team.slug}/live" live />
    </div>
  </div>
{/if}

{#if scheduledGames.length}
  <div class="my-2">
    <p class="text-lg font-semibold">Scheduled</p>
    {#each scheduledGames as game}
      <div on:contextmenu={contextMenuHandler(game)} role="article">
        <GameCard {team} {game} scheduled />
      </div>
    {/each}
  </div>
{/if}

{#if finishedGames.length}
  <div class="my-2">
    <p class="text-lg font-semibold">Past</p>
    {#each finishedGames as game}
      <div on:contextmenu={contextMenuHandler(game)} role="article">
        <GameCard {team} {game} finished />
      </div>
    {/each}
  </div>
{/if}
