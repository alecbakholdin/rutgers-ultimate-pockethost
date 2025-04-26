<script context="module" lang="ts">
  export const selectedPlayers = localStorageStore<string[]>(
    'selectedPlayers',
    [],
  )
</script>

<script lang="ts">
  import { pb } from '$lib/pocketbase/pb'
  import {
    GamePointEventTypeOptions,
    GamePointTypeOptions,
    PlayerStatusOptions,
    type GamePointRecord,
    type TeamGroupRecord,
    type PlayerResponse,
  } from '$lib/pocketbase/pocketbase-types'
  import { newShade } from '$lib/util/functions/changeShade'
  import { toggleArray } from '$lib/util/functions/toggleArray'
  import Icon from '@iconify/svelte'
  import _ from 'lodash'
  import { createEventDispatcher } from 'svelte'
  import { scale } from 'svelte/transition'
  import { getLiveGameContext, type LiveFeedGamePoint } from './gamePointType'
  import { localStorageStore } from '$lib/util/localStorageStore'

  const { game, players, gamePoints, team, gameOver } = getLiveGameContext()
  $: groups = $team?.expand?.['team_group(team)'] || []
  $: calculatedPlayers = $players.map((player) => ({
    ...player,
    lastPlayedPoint:
      $gamePoints?.findIndex(pointContainsPlayer(player.id)) ?? 0,
    pointsPlayed:
      $gamePoints?.filter(pointContainsPlayer(player.id)).length ?? 0,
    goals: $gamePoints?.filter((x) => x.goal === player.id).length ?? 0,
    assists: $gamePoints?.filter((x) => x.assist === player.id).length ?? 0,
    blocks: eventCount(GamePointEventTypeOptions.Block, player.id),
    turns: eventCount(GamePointEventTypeOptions.Turn, player.id),
    drops: eventCount(GamePointEventTypeOptions.Drop, player.id),
  }))
  $: allEvents =
    $gamePoints?.flatMap(
      (x) => x.expand?.['game_point_event(game_point)'] || [],
    ) || []
  $: eventCount = (type: GamePointEventTypeOptions, player?: string) =>
    allEvents?.filter(
      (x) => x.type === type && (!player || x.player === player),
    ).length ?? 0

  let selectedGroups: string[] = []
  $: playersInGroup = _.uniq(
    selectedGroups.flatMap(
      (id) => groups.find((g) => g.id === id)?.players || [],
    ),
  )
  $: filteredPlayers = selectedGroups.length
    ? calculatedPlayers.filter((p) => playersInGroup.includes(p.id))
    : calculatedPlayers
  $: playersByStatus = _.groupBy(
    filteredPlayers,
    (x) => x.status || PlayerStatusOptions.active,
  )
  $: playerSections = [
    ['', playersByStatus[PlayerStatusOptions.active]],
    ['Injured', playersByStatus[PlayerStatusOptions.injured]],
    ['Inactive', playersByStatus[PlayerStatusOptions.inactive]],
  ].filter(([_, arr]) => arr?.length) as [
    string,
    (PlayerResponse & {
      pointsPlayed: number
      lastPlayedPoint: number
      goals: number
      assists: number
      blocks: number
      turns: number
      drops: number
    })[],
  ][]

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
  $: pointInProgress = !!$gamePoints?.find((x, i) => !x.end)
  async function submitToPoint(
    nonStandard?:
      | GamePointTypeOptions.Half
      | GamePointTypeOptions.TeamTimeout
      | GamePointTypeOptions.OpponentTimeout
      | GamePointTypeOptions.Final,
  ) {
    if (!$game) return
    const O = GamePointTypeOptions.O
    const D = GamePointTypeOptions.D
    const type = ($gamePoints?.length && $gamePoints[0].opponent_goal && O) || D
    const point: GamePointRecord = {
      game: $game.id,
      starting_line: nonStandard ? [] : $selectedPlayers,
      team_score: $game.team_score,
      opponent_score: $game.opponent_score,
      type: nonStandard || type,
    }
    if (nonStandard) {
      point.end = new Date() as any
    }
    await pb.collection('game_point').create(point)
    if (nonStandard === GamePointTypeOptions.Final) {
      await pb.collection('game').update($game.id, {
        end: new Date(),
      })
    }
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
  $: firstHalf = !$gamePoints?.find((x) => x.type === GamePointTypeOptions.Half)
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
    {#if firstHalf}
      <button
        type="button"
        class="btn w-full mb-2"
        on:click={() => submitToPoint(GamePointTypeOptions.Half)}
      >
        Halftime
      </button>
    {/if}

    <div class="flex items-center gap-1">
      <button
        type="button"
        class="btn flex-grow mb-2"
        on:click={() => submitToPoint(GamePointTypeOptions.TeamTimeout)}
      >
        Our Timeout
      </button>
      <button
        type="button"
        class="btn flex-grow mb-2"
        on:click={() => submitToPoint(GamePointTypeOptions.OpponentTimeout)}
      >
        Their Timeout
      </button>
    </div>
    <button
      class="btn w-full mb-2"
      on:click={() => submitToPoint(GamePointTypeOptions.Final)}
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
    <div
      tabindex="0"
      role="button"
      class="btn btn-outline btn-sm opacity-70"
      class:disabled={!$selectedPlayers.length}
    >
      + Add to Group
    </div>
    <div
      class="dropdown-content z-[1] card card-compact shadow bg-neutral-50 text-neutral-400"
    >
      <div class="card-body flex flex-col">
        {#each groups as group}
          <button
            type="button"
            class="badge badge-lg pointer-cursor whitespace-nowrap"
            style:background-color={group.color}
            on:click={() =>
              pb.collection('team_group').update(group.id, {
                players: _.uniq([...group.players, ...$selectedPlayers]),
              })}
          >
            {group.name} ({group.players?.length})
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
    }}
    class:disabled={!$selectedPlayers.length}
  >
    + Create new Group
  </button>
  <div class="dropdown">
    <div tabindex="0" role="button" class="btn btn-outline btn-sm opacity-70">
      Change Status
    </div>
    <div
      class="dropdown-content z-[1] card card-compact shadow bg-neutral-50 text-neutral-400"
    >
      <div class="card-body flex flex-col">
        {#each Object.values(PlayerStatusOptions) as status}
          <button
            type="button"
            class="btn btn-outline btn-sm"
            on:click={() => {
              $selectedPlayers.forEach((player) =>
                pb.collection('player').update(player, { status }),
              )
            }}>{status}</button
          >
        {/each}
      </div>
    </div>
  </div>
</div>
<div class="h-2"></div>
{#if groups.length}
  <p class="label">Groups</p>
{/if}
<div class="flex gap-1 flex-nowrap overflow-x-scroll pb-3">
  {#each groups as group}
    {@const selected = !!selectedGroups.includes(group.id)}
    <button
      type="button"
      class="badge badge-lg cursor-pointer badge-outline border-2 select-none whitespace-nowrap"
      style:border-color={selected ? newShade(group.color, -40) : 'transparent'}
      style:background-color={group.color}
      on:contextmenu|stopPropagation|preventDefault={() => {
        modalGroup = { ...group }
        modalPlayerOptions = [...group.players]
        openModal('group_modal')
      }}
      on:click={() => (selectedGroups = toggleArray(selectedGroups, group.id))}
    >
      {group.name} ({$selectedPlayers.length
        ? $selectedPlayers.filter((x) => group.players?.includes(x)).length +
          '/'
        : ''}{group.players?.length})
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
    <span class="text-lg font-semibold"
      >Player ({$selectedPlayers.length
        ? `${$selectedPlayers.length}/`
        : ''}{playersByStatus[PlayerStatusOptions.active].length})</span
    >
  </div>
  {#each playerSections as [status, players]}
    {#if status}
      <p class="text-lg border-b">
        {status}
      </p>
    {/if}
    {#each players as player}
      {@const checkboxId = `player-${player.id}`}
      <label
        for={checkboxId}
        class="flex items-center gap-3 cursor-pointer"
        style="background-color:{groups.find(
          (x) => x.use_as_color && x.players?.includes(player.id),
        )?.color}"
      >
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
            {player.goals}G {player.assists}A
            {player.blocks}B {player.turns}T {player.drops}D |
            {player.lastPlayedPoint < 0
              ? 'Has Not Played'
              : player.lastPlayedPoint > 0
                ? `Played ${player.lastPlayedPoint} Point${
                    player.lastPlayedPoint > 1 ? 's' : ''
                  } Ago`
                : 'Just Played'} | {player.pointsPlayed ?? 0} Points
          </p>
        </div>
      </label>
    {/each}
  {/each}
</div>
