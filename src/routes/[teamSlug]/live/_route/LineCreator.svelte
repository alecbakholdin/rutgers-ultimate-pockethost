<script context="module" lang="ts">
  import { writable } from 'svelte/store'
  const selectedPlayers = writable<string[]>([])
</script>

<script lang="ts">
  import { scale } from 'svelte/transition'
  import { getLiveGameContext, type LiveFeedGamePoint } from './gamePointType'
  import Icon from '@iconify/svelte'
  import { pb } from '$lib/pocketbase/pb'
  import {
    GamePointTypeOptions,
    type GamePointRecord,
    type TeamGroupRecord,
    type TeamGroupResponse,
  } from '$lib/pocketbase/pocketbase-types'
  import { toggleArray } from '$lib/util/functions/toggleArray'
  import _ from 'lodash'
  import { newShade } from '$lib/util/functions/changeShade'
  import { createEventDispatcher } from 'svelte'

  const { game, players, gamePoints, team, gameOver } = getLiveGameContext()
  $: groups = $team?.expand?.['team_group(team)'] || []
  $: calculatedPlayers = $players.map((player) => ({
    ...player,
    lastPlayedPoint:
      $gamePoints?.findIndex(pointContainsPlayer(player.id)) ?? 0,
    pointsPlayed:
      $gamePoints?.filter(pointContainsPlayer(player.id)).length ?? 0,
  }))

  let selectedGroups: string[] = []
  $: playersInGroup = _.uniq(
    selectedGroups.flatMap(
      (id) => groups.find((g) => g.id === id)?.players || [],
    ),
  )
  $: filteredPlayers = selectedGroups.length
    ? calculatedPlayers.filter((p) => playersInGroup.includes(p.id))
    : calculatedPlayers

  function pointContainsPlayer(playerId: string) {
    return (pt: LiveFeedGamePoint) =>
      pt.starting_line.includes(playerId) || pt.subs.includes(playerId)
  }

  function openModal(id: string) {
    ;(document.getElementById(id) as HTMLDialogElement)?.showModal()
  }

  const colorOptions = [
    '#faedcb',
    '#c9e4de',
    '#c6def1',
    '#dbcdf0',
    '#f2c6de',
    '#f7d9c4',
  ] as const
  let groupToAddTo: string | undefined
  let modalPlayerOptions: string[] = []
  let modalGroup: TeamGroupRecord & { id?: string } = {
    name: '',
    team: $team?.id ?? '',
  }

  async function submitModalGroup() {
    if (!$team?.id) return

    const { id, ...rest } = modalGroup
    if (id) {
      await pb.collection('team_group').update(id, rest)
    } else {
      await pb.collection('team_group').create(rest)
    }
  }

  const dispatch = createEventDispatcher<{ startPoint: void }>()
  $: pointInProgress = !!$gamePoints?.find((x) => !x.goal && !x.opponent_goal)
  async function submitToPoint(final?: boolean) {
    if (!$game) return
    const O = GamePointTypeOptions.O
    const D = GamePointTypeOptions.D
    const Final = GamePointTypeOptions.Final
    const type = ($gamePoints?.length && $gamePoints[0].opponent_goal && O) || D
    const point: GamePointRecord = {
      game: $game.id,
      starting_line: final ? [] : $selectedPlayers,
      team_score: $game.team_score,
      opponent_score: $game.opponent_score,
      type: final ? Final : type,
    }
    await pb.collection('game_point').create(point)
    $selectedPlayers = []
    dispatch('startPoint')
  }

  $: atLeastOnePlayerSelected = Boolean(
    filteredPlayers.find((x) => $selectedPlayers.includes(x.id)),
  )
  $: allPlayersSelected = !filteredPlayers.find(
    (x) => !$selectedPlayers.includes(x.id),
  )
  $: somePlayersSelected = !allPlayersSelected && atLeastOnePlayerSelected
  $: noPlayersSelected = !atLeastOnePlayerSelected
</script>

{#if !pointInProgress}
  <div>
    <button
      type="button"
      class="btn btn-primary w-full mb-2"
      disabled={$selectedPlayers.length !== 7 || $gameOver}
      on:click={() => submitToPoint()}
    >
      Submit to point ({$selectedPlayers.length}/7)
    </button>
    <button
      class="btn w-full mb-2"
      on:click={() => submitToPoint(true)}
      disabled={$gameOver}
    >
      Mark as Final Score
    </button>
  </div>
{/if}

<dialog id="group_modal" class="modal">
  <form method="dialog" class="modal-backdrop">
    <button class="pointer-default"></button>
  </form>
  <div class="modal-box flex flex-col">
    <h3 class="font-bold text-lg">Configure your group</h3>
    <label for="group_name" class="label mt-2">Group Name</label>
    <input
      class="input input-bordered"
      type="text"
      name="group_name"
      id="group_name"
      placeholder="Name"
      bind:value={modalGroup.name}
    />

    <label for="new_group_color" class="label mt-2">Color</label>
    <div class="flex gap-1">
      {#each colorOptions as color}
        <input
          type="radio"
          id={color}
          name="new_group_color"
          class="hidden"
          checked={modalGroup.color === color}
          on:click={() =>
            (modalGroup.color = color === modalGroup.color ? undefined : color)}
        />
        <label
          for={color}
          class="w-12 h-12 rounded-full cursor-pointer grid place-items-center"
          style:background-color={color}
        >
          {#if color === modalGroup.color}
            <div transition:scale={{ duration: 100 }}>
              <Icon icon="mdi:check" class="text-gray-700 text-xl" />
            </div>
          {/if}
        </label>
      {/each}
    </div>
    <div class="flex flex-col gap-2 mt-2">
      {#if modalPlayerOptions.length}
        <span class="font-semibold text-lg">Players</span>
      {/if}
      {#each modalPlayerOptions as playerId (playerId)}
        {@const player = calculatedPlayers.find((x) => x.id === playerId)}
        {#if player}
          <label for="modal_player_{playerId}" class="flex items-center gap-2">
            <input
              type="checkbox"
              name="modal_player_{playerId}"
              id="modal_player_{playerId}"
              class="checkbox"
              checked={modalGroup.players?.includes(playerId)}
              on:click={() =>
                (modalGroup.players = toggleArray(
                  modalGroup.players,
                  playerId,
                ))}
            />
            <span>{player.name}</span>
          </label>
        {/if}
      {/each}
    </div>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Close</button>
        {#if modalGroup.id}
          <button
            class="btn btn-error"
            on:click={() =>
              modalGroup.id &&
              pb.collection('team_group').delete(modalGroup.id)}
          >
            Delete
          </button>
        {/if}
        <button
          class="btn btn-primary"
          disabled={!modalGroup.name?.trim()}
          on:click={() => submitModalGroup()}
        >
          {#if modalGroup.id}
            Submit
          {:else}
            Create
          {/if}
        </button>
      </form>
    </div>
  </div>
</dialog>
<div class="flex gap-1">
  <div class="dropdown">
    <div tabindex="0" role="button" class="btn btn-outline btn-sm opacity-70">
      + Add to Group
    </div>
    <div
      class="dropdown-content z-[1] card card-compact shadow bg-neutral-50 text-neutral-400"
    >
      <div class="card-body flex flex-col">
        {#each groups as group}
          <button
            type="button"
            class="badge badge-lg pointer-cursor"
            on:click={() =>
              pb.collection('team_group').update(group.id, {
                players: _.uniq([...group.players, ...$selectedPlayers]),
              })}
          >
            {group.name}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <button
    type="button"
    class="btn btn-outline btn-sm opacity-70"
    on:click={() => {
      modalGroup = {
        team: $team?.id ?? '',
        name: '',
        players: [...$selectedPlayers],
      }
      modalPlayerOptions = [...$selectedPlayers]
      openModal('group_modal')
    }}>+ Create new Group</button
  >
</div>
<div class="h-2"></div>
{#if groups.length}
  <p class="label">Groups</p>
{/if}
<div class="flex gap-1">
  {#each groups as group}
    {@const selected = !!selectedGroups.includes(group.id)}
    <button
      type="button"
      class="badge badge-lg cursor-pointer badge-outline border-2"
      style:border-color={selected ? newShade(group.color, -40) : 'transparent'}
      style:background-color={group.color}
      on:contextmenu|stopPropagation|preventDefault={() => {
        modalGroup = { ...group }
        modalPlayerOptions = [...group.players]
        openModal('group_modal')
      }}
      on:click={() => (selectedGroups = toggleArray(selectedGroups, group.id))}
    >
      {group.name}
    </button>
  {/each}
</div>
<div class="flex flex-col gap-1 mt-6">
  <div class="flex items-center gap-3 pb-2 border-b-neutral-content border-b-2">
    <input
      type="checkbox"
      name="select_all"
      id="select_all"
      class="checkbox"
      checked={allPlayersSelected}
      indeterminate={somePlayersSelected}
      on:change={(e) =>
        e.currentTarget.checked
          ? ($selectedPlayers = filteredPlayers.map((x) => x.id))
          : ($selectedPlayers = $selectedPlayers.filter(
              (x) => !filteredPlayers.find((f) => f.id === x),
            ))}
    />
    <span class="text-lg font-semibold">Player</span>
  </div>
  {#each filteredPlayers as player}
    {@const checkboxId = `player-${player.id}`}
    <label for={checkboxId} class="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={checkboxId}
        id={checkboxId}
        class="checkbox"
        checked={$selectedPlayers.includes(player.id)}
        on:click={() =>
          ($selectedPlayers = toggleArray($selectedPlayers, player.id))}
      />
      <div>
        <p>{player.name}</p>
        <p class="text-gray-400">
          {player.lastPlayedPoint < 0
            ? 'Has Not Played'
            : player.lastPlayedPoint > 0
              ? `Played ${player.lastPlayedPoint} Point${
                  player.lastPlayedPoint > 1 ? 's' : ''
                } Ago`
              : 'Just Played'} |
          {player.pointsPlayed ?? 0} Points
        </p>
      </div>
    </label>
  {/each}
</div>
