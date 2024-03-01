<script lang="ts">
  import { enhance } from '$app/forms'
  import { toast } from '$lib/component/Toasts.svelte'
  import type {
    GameRecord,
    GameResponse,
  } from '$lib/pocketbase/pocketbase-types'
  import GameList from './_route/GameList.svelte'

  export let data

  let modal: HTMLDialogElement
  let modalGame: GameResponse

  function openModal(game: GameResponse) {
    if (!data.user?.isManager) return
    modalGame = game
    modal?.showModal()
  }

  function freshGameRecord(): GameRecord {
    return {
      team: data.team.id,
      opponent: '',
      opponent_score: 0,
      team_score: 0,
    }
  }
  let newGame = freshGameRecord()

  let newGameStartDate: string
  let newGameStartTime: string
  $: newGame.start =
    newGameStartDate && newGameStartTime
      ? `${newGameStartDate}T${newGameStartTime}`
      : undefined
</script>

<dialog class="modal" bind:this={modal}>
  <div class="modal-box">
    <div class="modal-top">
      <h3>
        {data.team.name} vs {modalGame?.opponent}
      </h3>
    </div>
    <form method="dialog">
      <button class="btn">Close</button>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button class="cursor-default"></button>
  </form>
</dialog>
<GameList team={data.team} {openModal} />

{#if data.user?.isManager}
  <div class="card">
    <form
      method="POST"
      action="?/createGame"
      use:enhance={() => {
        return async ({ result, update }) => {
          result.type === 'error' &&
            toast({ type: 'error', message: result.error?.message })
          result.type === 'failure' &&
            toast({ type: 'error', message: 'Unexpected failure' })
          if(result.type !== 'error' && result.type !== 'failure') await update();
        }
      }}
      class="card-body"
    >
      <div class="card-title">
        <h3>New Game</h3>
      </div>
      <div class="flex flex-col gap-1">
        <label for="opponent" class="label">Opponent</label>
        <input
          type="text"
          name="opponent"
          id="opponent"
          class="input input-bordered"
          placeholder="Opponent"
          bind:value={newGame.opponent}
        />
        <label for="start_date" class="label">Start</label>
        <div class="flex gap-1 [&>*]:flex-grow">
          <input
            class="input input-bordered"
            type="date"
            name="start_date"
            id="start_date"
            aria-label="start date"
            bind:value={newGameStartDate}
          />
          <input
            class="input input-bordered"
            type="time"
            name="start_time"
            id="start_time"
            aria-label="start time"
            bind:value={newGameStartTime}
          />
        </div>
      </div>
      <div class="card-actions">
        <button class="btn">+ Create Game</button>
      </div>
    </form>
  </div>
{/if}
