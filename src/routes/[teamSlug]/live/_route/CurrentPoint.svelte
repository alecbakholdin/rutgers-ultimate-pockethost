<script lang="ts">
  import { pb } from '$lib/pocketbase/pb'
  import {
    GamePointTypeOptions,
    type GamePointRecord,
    GamePointEventTypeOptions,
    type GamePointEventRecord,
  } from '$lib/pocketbase/pocketbase-types'
  import { createEventDispatcher } from 'svelte'
  import {
    type LiveFeedGamePointEvent,
    getLiveGameContext,
  } from './gamePointType'
  import Icon from '@iconify/svelte'
  import _ from 'lodash'
  import { selectedPlayers } from './LineCreator.svelte'

  const { team, game, gamePoints, ourPossession } = getLiveGameContext()
  $: lastPoint = ($gamePoints?.length && $gamePoints[0]) || undefined
  $: livePoint = $gamePoints?.find(
    (x) => !x.opponent_goal && !x.goal && x.type !== GamePointTypeOptions.Final,
  )

  async function updatePointType(type: GamePointTypeOptions) {
    if (livePoint && livePoint.type !== type) {
      pb.collection('game_point').update(livePoint.id, {
        type,
      } satisfies Partial<GamePointRecord>)
    }
  }

  let message: string;
  async function createNewEvent(
    type: GamePointEventTypeOptions,
    player?: string,
  ) {
    if (!livePoint) return
    const pointEvent: GamePointEventRecord = {
      type,
      game_point: livePoint.id,
      opponent: !player,
      player,
      message,
    }
    const event = await pb
      .collection('game_point_event')
      .create<LiveFeedGamePointEvent>(pointEvent, { expand: 'player' })

    message = ''
    const pointIndex = $gamePoints.findIndex((x) => x.id === livePoint?.id)
    const point = $gamePoints.find((x) => x.id === livePoint?.id)
    point?.expand?.['game_point_event(game_point)']?.unshift(event)
    if (!point?.expand?.['game_point_event(game_point)'] && point?.expand) {
      point.expand = {
        ...point.expand,
        'game_point_event(game_point)': [event],
      }
    }
    if (point) {
      $gamePoints[pointIndex] = point
    }
  }

  async function setPointValue<T extends keyof GamePointRecord>(
    key: T,
    value: GamePointRecord[T],
  ) {
    if (!livePoint) return
    pb.collection('game_point').update(livePoint.id, {
      [key]: value,
    })
    livePoint = { ...livePoint, [key]: value }
  }
  const dispatch = createEventDispatcher<{ pointOver: void }>()

  async function undo() {
    if (!lastPoint) return
    const gamePointEvents = _.orderBy(
      lastPoint.expand?.['game_point_event(game_point)'] || [],
      ['created'],
      ['desc'],
    )
    if (lastPoint.opponent_goal) {
      await pb.collection('game_point').update(lastPoint.id, {
        opponent_goal: false,
      } satisfies Partial<GamePointRecord>)
      await pb.collection('game').update(lastPoint.game, {
        'opponent_score-': 1,
      })
    } else if (lastPoint.goal) {
      await pb.collection('game_point').update(lastPoint.id, {
        goal: '',
      } satisfies Partial<GamePointRecord>)
      await pb.collection('game').update(lastPoint.game, {
        'team_score-': 1,
      })
    } else if (lastPoint.assist) {
      await pb.collection('game_point').update(lastPoint.id, {
        assist: '',
      } satisfies Partial<GamePointRecord>)
    } else if (gamePointEvents.length) {
      await pb.collection('game_point_event').delete(gamePointEvents[0].id)
    } else {
      $selectedPlayers = [...lastPoint.starting_line]
      await pb.collection('game_point').delete(lastPoint.id)
      dispatch('pointOver')
    }
  }

  let subModal: HTMLDialogElement
  let subOut: string | undefined
  let subIn: string | undefined
  $: activePlayers = livePoint?.starting_line || []
  $: subOptions =
    $team?.expand?.['player(team)'].filter(
      (x) => !activePlayers.includes(x.id),
    ) || []
  async function performSub() {
    if (!livePoint || !subIn || !subOut) return
    pb.collection('game_point').update(livePoint.id, {
      'starting_line-': subOut,
      'subs+': subOut,
    })
    pb.collection('game_point').update(livePoint.id, {
      'starting_line+': subIn,
    })
  }
</script>

{#if livePoint}
  <div class="flex justify-between">
    <div>
      <div class="flex gap-1">
        <button
          type="button"
          class="btn"
          class:pointer-events-none={livePoint.type === GamePointTypeOptions.O}
          class:btn-primary={livePoint.type === GamePointTypeOptions.O}
          on:click={() => updatePointType(GamePointTypeOptions.O)}
        >
          O
        </button>
        <button
          type="button"
          class="btn"
          class:pointer-events-none={livePoint.type === GamePointTypeOptions.D}
          class:btn-primary={livePoint.type === GamePointTypeOptions.D}
          on:click={() => updatePointType(GamePointTypeOptions.D)}
        >
          D
        </button>
      </div>
    </div>
    <button type="button" class="btn" on:click={undo}>
      <Icon icon="mdi:undo" />
      Undo
    </button>
  </div>
  <div class="flex flex-col gap-2 mt-2">
    {#each livePoint.expand?.starting_line || [] as player}
      <div class="flex items-center gap-1">
        <span class="flex-grow">{player.name}</span>
        {#if !$ourPossession}
          <button
            type="button"
            class="btn btn-sm btn-info bg-opacity-30"
            on:click={() =>
              createNewEvent(GamePointEventTypeOptions.Block, player.id)}
          >
            Block
          </button>
        {:else if !livePoint.assist}
          <button
            type="button"
            class="btn btn-sm btn-warning bg-opacity-30"
            on:click={() =>
              createNewEvent(GamePointEventTypeOptions.Turn, player.id)}
          >
            Turn
          </button>
          <button
            type="button"
            class="btn btn-sm btn-warning bg-opacity-30"
            on:click={() =>
              createNewEvent(GamePointEventTypeOptions.Drop, player.id)}
          >
            Drop
          </button>
          <button
            type="button"
            class="btn btn-sm btn-success bg-opacity-30"
            on:click={() => setPointValue('assist', player.id)}
          >
            Assist
          </button>
        {:else}
          <button
            type="button"
            class="btn btn-sm btn-success bg-opacity-30"
            on:click={() => {
              setPointValue('goal', player.id)
              if (!livePoint) return
              pb.collection('game').update(livePoint.game, {
                'team_score+': 1,
              })
              dispatch('pointOver')
            }}
          >
            {#if player.id === livePoint.assist}
              Callahan
            {:else}
              Goal
            {/if}
          </button>
        {/if}
      </div>
    {/each}
    {#if !$ourPossession}
      <div class="w-full my-8 flex flex-col gap-2">
        <button
          type="button"
          class="btn btn-info bg-opacity-30 w-full"
          on:click={() => createNewEvent(GamePointEventTypeOptions.Turn)}
        >
          {$game?.opponent ?? 'Opponent'} Turn
        </button>
        <button
          type="button"
          class="btn btn-error bg-opacity-30 w-full"
          on:click={() => {
            setPointValue('opponent_goal', true)
            if (!livePoint) return
            pb.collection('game').update(livePoint.game, {
              'opponent_score+': 1,
            })
            dispatch('pointOver')
          }}
        >
          {$game?.opponent ?? 'Opponent'} Goal
        </button>
      </div>
    {/if}
    <input class="input input-bordered w-full my-1" placeholder="Message" bind:value={message} autocapitalize="off" />
    <button
      type="button"
      class="btn w-full"
      on:click={() => {
        subIn = undefined
        subOut = undefined
        subModal.showModal()
      }}>Make Substitution</button
    >
    <dialog class="modal" bind:this={subModal}>
      <form method="dialog" class="modal-backdrop"><button></button></form>
      <div class="modal-box">
        <div class="modal-top">
          <h3 class="text-xl font-semibold">Make Substitution</h3>
        </div>
        <div class="modal-middle">
          <label for="subOut" class="label">Out</label>
          <select
            name="subOut"
            id="subOut"
            class="select select-bordered"
            bind:value={subOut}
          >
            {#each livePoint?.expand?.['starting_line'] || [] as player}
              <option value={player.id}>{player.name}</option>
            {/each}
          </select>
          <label for="subIn" class="label">In</label>
          <select
            name="subIn"
            id="subIn"
            class="select select-bordered"
            bind:value={subIn}
          >
            {#each subOptions as player}
              <option value={player.id}>{player.name}</option>
            {/each}
          </select>
        </div>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Close</button>
            <button class="btn btn-primary" on:click={() => performSub()}
              >Submit</button
            >
          </form>
        </div>
      </div>
    </dialog>
  </div>
{:else}
  <div class="flex flex-col gap-2 w-full">
    <button type="button" class="btn btn-neutral" on:click={undo}>
      <Icon icon="mdi:undo" />
      Undo
    </button>
  </div>
{/if}
