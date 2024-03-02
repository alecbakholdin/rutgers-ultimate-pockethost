<script lang="ts">
  import {
    GamePointEventTypeOptions,
    type GamePointRecord,
  } from '$lib/pocketbase/pocketbase-types.js'
  import Icon from '@iconify/svelte'
  import _ from 'lodash'

  export let data
  $: players = data.players.map((p) => {
    const points =
      matchingPoints('starting_line', p.id) + matchingPoints('subs', p.id)
    const goals = matchingPoints('goal', p.id)
    const assists = matchingPoints('assist', p.id)
    const blocks = matchingPointEvents('Block', p.id)
    const turns = matchingPointEvents('Turn', p.id)
    const drops = matchingPointEvents('Drop', p.id)
    const plusMinus = goals + assists + blocks - turns - drops
    const plusMinusPerPoint = plusMinus / points
    return {
      id: p.id,
      name: p.name,
      points,
      goals,
      assists,
      blocks,
      turns,
      drops,
      plusMinus,
      plusMinusPerPoint,
    }
  })
  type PlayerKey = keyof (typeof players)[number]
  $: displayedPlayerKeys = players.length
    ? (Object.keys(players[0]).filter((x) => x !== 'id') as PlayerKey[])
    : []
  function mapName(key: PlayerKey) {
    switch (key) {
      case 'plusMinus':
        return '+/-'
      case 'plusMinusPerPoint':
        return '+/-/point'
      default:
        return key.slice(0, 1).toUpperCase() + key.slice(1)
    }
  }

  let sortBy: PlayerKey | undefined = undefined
  let sortDir: 'asc' | 'desc' = 'asc'

  $: sortedPlayers = sortBy ? _.orderBy(players, [sortBy, sortDir]) : players
  function toggleSort(key: PlayerKey) {
    if (sortBy !== key) {
      sortBy = key
      sortDir = 'asc'
    } else if (sortBy === key && sortDir === 'asc') {
      sortDir = 'desc'
    } else {
      sortBy = undefined
      sortDir = 'asc'
    }
  }

  function matchingPoints<T extends keyof GamePointRecord>(
    key: T,
    player: string,
  ) {
    return data.points.filter((x) =>
      typeof Array.isArray(x[key])
        ? (x[key] as Array<string>).includes(player)
        : x[key] === player,
    ).length
  }
  function matchingPointEvents<
    T extends keyof typeof GamePointEventTypeOptions,
  >(type: T, player: string) {
    return data.pointEvents.filter(
      (x) => x.type === GamePointEventTypeOptions[type] && x.player === player,
    ).length
  }
</script>

<div class="max-w-md mx-auto">
  <form method="get">
    <label for="start_date" class="label">Start Date</label>
    <input
      type="date"
      name="start_date"
      id="start_date"
      class="input input-bordered"
      placeholder="Start Date"
    />
    <label for="end_date" class="label">End Date</label>
    <input
      type="date"
      name="end_date"
      id="end_date"
      class="input input-bordered"
      placeholder="End Date"
    />
    <button class="btn block mt-2">Submit</button>
  </form>
</div>

<div class="max-w-md mx-auto overflow-x-auto">
  <table class="table">
    <thead>
      {#each displayedPlayerKeys as key}
        <th
          role="button"
          on:click={() => toggleSort(key)}
          class="cursor-pointer select-none"
        >
          <div class="flex items-center w-fit">
            <div
              class="w-2 grid place-items-center"
              class:rotate-180={sortDir === 'desc'}
            >
              {#if sortBy === key}
                <Icon icon="mdi:chevron-up"></Icon>
              {/if}
            </div>
            <span>
              {mapName(key)}
            </span>
          </div>
        </th>
      {/each}
    </thead>
    <tbody>
      {#each sortedPlayers as player}
        <tr>
          {#each displayedPlayerKeys as key}
            <td>{player[key]}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
