<script lang="ts">
  import type {
    GameResponse,
    TeamResponse,
  } from '$lib/pocketbase/pocketbase-types'
  import _ from 'lodash'
  import GameCard from './GameCard.svelte'
  import { openModal } from './GameModal.svelte'

  export let team: TeamResponse<{ 'game(team)': GameResponse[] }>

  $: teamGames = team.expand?.['game(team)'] || []
  $: liveGame = teamGames.find((x) => x.id === team.live_game)
  $: nonLiveGames = _.reverse(teamGames.filter((x) => x.id !== team.live_game))
  $: today = nonLiveGames.filter(
    (x) => new Date(x.start).toDateString() === new Date().toDateString(),
  )
  $: yesterday = nonLiveGames.filter((x) => {
    const yesterday = new Date()
    yesterday.setDate(new Date().getDate() - 1)
    return new Date(x.start).toDateString() === yesterday.toDateString()
  })
  $: tomorrow = _.reverse(
    nonLiveGames.filter((x) => {
      const tomorrow = new Date()
      tomorrow.setDate(new Date().getDate() + 1)
      return new Date(x.start).toDateString() === tomorrow.toDateString()
    }),
  )
  $: others = nonLiveGames.filter(
    (x) =>
      !today.find((t) => t.id === x.id) &&
      !yesterday.find((t) => t.id === x.id) &&
      !tomorrow.find((t) => t.id === x.id),
  )
  $: sections = {
    Today: today,
    Yesterday: yesterday,
    Tomorrow: tomorrow,
    Other: others,
  }
  $: sectionKeys = [
    'Tomorrow',
    'Today',
    'Yesterday',
    'Other',
  ] satisfies (keyof typeof sections)[]

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

{#each sectionKeys as sectionKey}
  {@const section = sections[sectionKey]}
  {#if section.length}
    <div class="my-2">
      <p class="text-lg font-semibold">{sectionKey}</p>
      <div class="flex flex-col gap-3">
        {#each section as game}
          <div on:contextmenu={contextMenuHandler(game)} role="article">
            <GameCard
              {team}
              {game}
              href="/{team.slug}/game/{game.id}"
              scheduled={!game.end}
              finished={!!game.end}
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
{/each}
