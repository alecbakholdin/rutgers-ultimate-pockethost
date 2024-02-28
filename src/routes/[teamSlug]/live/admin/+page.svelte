<script lang="ts">
  import LiveFeed from '../_route/LiveFeed.svelte'
  import {
    getLiveGameContext,
    type LiveFeedGamePoint,
  } from '../_route/gamePointType'

  export let data
  const tabs = ['Lines', 'Current Point', 'Feed'] as const
  let activeTab: (typeof tabs)[number] = tabs[0]

  const { players, gamePoints } = getLiveGameContext()
  let selectedPlayers: string[] = []
  $: calculatedPlayers = $players.map((player) => ({
    ...player,
    lastPlayedPoint: $gamePoints?.findIndex(pointContainsPlayer(player.id)) ?? 0,
    pointsPlayed: $gamePoints?.filter(pointContainsPlayer(player.id)).length ?? 0,
  }))

  function pointContainsPlayer(playerId: string) {
    return (pt: LiveFeedGamePoint) =>
      pt.starting_line.includes(playerId) || pt.subs.includes(playerId)
  }
</script>

<div class="max-w-xl mx-auto">
  <div class="tabs tabs-boxed mt-8 mb-4">
    {#each tabs as tab}
      <button
        type="button"
        id={tab}
        aria-label={tab}
        role="tab"
        class="tab"
        class:tab-active={activeTab === tab}
        on:click={() => (activeTab = tab)}
      >
        {tab}
      </button>
    {/each}
  </div>
  {#if activeTab === 'Lines'}
   <div class="flex gap-1">
      <button type="button" class="btn btn-outline btn-sm opacity-70">+Temporary</button>
      <button type="button" class="btn btn-outline btn-sm opacity-70">+Temporary</button>
      <button type="button" class="btn btn-outline btn-sm opacity-70">+Temporary</button>
      <button type="button" class="btn btn-outline btn-sm opacity-70">+Temporary</button>
   </div>
    <table class="table">
      <thead>
        <th></th>
        <th>Player</th>
        <th>Last Played</th>
        <th>Points Played</th>
      </thead>
      <tbody>
        {#each calculatedPlayers as player}
          {@const checkId = `player-${player.id}`}

          {@const selected = selectedPlayers.includes(player.id)}
          <tr
            on:click={() => document.getElementById(checkId)?.click()}
            class="cursor-pointer"
            aria-label={player.name}
            role="checkbox"
            aria-checked={selected}
          >
            <td>
              <input
                type="checkbox"
                name={checkId}
                id={checkId}
                class="checkbox"
                checked={selectedPlayers.includes(player.id)}
                on:click={() =>
                  (selectedPlayers = selected
                    ? selectedPlayers.filter((x) => x !== player.id)
                    : [...selectedPlayers, player.id])}
              />
            </td>
            <td>{player.name}</td>
            <td>
              {#if player.lastPlayedPoint < 0}
                -
              {:else if player.lastPlayedPoint === 0}
                Just now
              {:else}
                {player.lastPlayedPoint + 1} pts ago
              {/if}
            </td>
            <td>
              {player.pointsPlayed || '-'}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if activeTab === 'Current Point'}{:else if activeTab === 'Feed'}
    <LiveFeed />
  {/if}
</div>
