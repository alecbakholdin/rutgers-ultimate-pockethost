<script lang="ts" context="module">
  import { derived, writable } from 'svelte/store'
  import type { GameResponse } from '$lib/pocketbase/pocketbase-types'
  import { getLiveGameContext } from '../live/_route/gamePointType'
  import { goto, invalidateAll } from '$app/navigation'
  import { pb } from '$lib/pocketbase/pb'
  import { page } from '$app/stores'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import dateFormat from 'dateformat'

  const modalGame = writable<GameResponse | undefined>(undefined)
  const modalFormattedStart = derived(modalGame, ($game) => {
    return dateFormat($game?.start, "yyyy-mm-dd'T'hh:MM")
  })

  let modal: HTMLDialogElement
  export function openModal(game: GameResponse) {
    console.log(modal, game)
    if (!modal) return
    modalGame.set(game)
    modal.showModal()
  }
  function closeModal() {
      if (!modal) return
      modalGame.set(undefined)
    modal.close()
  }
</script>

<script lang="ts">
  const { team } = $page.data

  const closeOnSuccess: SubmitFunction =
    () =>
    async ({ update, result }) => {
        if (result.type === 'success') {
            closeModal()
        }
        await update()
    }
</script>

<dialog class="modal" bind:this={modal}>
  <div class="modal-box">
    <div class="modal-top mb-4">
      <h3 class="text-2xl font-semibold">
        {team?.name} vs {$modalGame?.opponent}
      </h3>
    </div>
    <form
    id="gameModalForm"
      method="post"
      action="?/editGame"
      class="modal-middle mb-4"
      use:enhance={closeOnSuccess}
    >
    {#if $modalGame}
      <input type="hidden" name="gameId" value={$modalGame?.id} />
      <label for="opponent" class="label">Opponent</label>
      <input
        type="text"
        name="opponent"
        id="opponent"
        class="input input-bordered"
        value={$modalGame?.opponent}
      />
      <label for="start" class="label">Start</label>
      <input
        type="datetime-local"
        name="start"
        id="gameModalStart"
        class="input input-bordered"
        value={$modalFormattedStart}
      />
    <label for="half_cap_min" class="label">Half Cap (min)</label>
    <input type="text" name="half_cap_min" class={"input input-bordered"} value={$modalGame?.half_cap_min}>
    <label for="soft_cap_min" class="label">Soft Cap (min)</label>
    <input type="text" name="soft_cap_min" class={"input input-bordered"} value={$modalGame?.soft_cap_min}>
    <label for="hard_cap_min" class="label">Hard Cap (min)</label>
    <input type="text" name="hard_cap_min" class={"input input-bordered"} value={$modalGame?.hard_cap_min}>
    {/if}
    </form>
    <div class="modal-action">
        <button form="gameModalForm" class="btn">Submit</button>
      {#if $modalGame?.id && $modalGame?.id !== team?.live_game}
        <form method="post" action="?/setLive" use:enhance={closeOnSuccess}>
          <input type="hidden" name="gameId" value={$modalGame?.id} />
          <button class="btn"> Set Live </button>
        </form>
      {:else}
        <form
          method="post"
          action="?/removeFromLive"
          use:enhance={closeOnSuccess}
        >
          <button class="btn">Remove from Live</button>
        </form>
      {/if}
      <form method="post" action="?/deleteGame" use:enhance={closeOnSuccess}>
        <button class="btn btn-error">Delete</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button class="cursor-default"></button>
  </form>
</dialog>
