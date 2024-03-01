<script lang="ts">
  import type { GameResponse } from '$lib/pocketbase/pocketbase-types'
  import GameList from '../_route/GameList.svelte'
  export let data

  let modal: HTMLDialogElement
  let modalGame: GameResponse
</script>

<GameList team={data.team} openModal={(game) => {
    modalGame = game;
    modal.showModal();
}}/>

<dialog class="modal" bind:this={modal}>
  <div class="modal-box"></div>
</dialog>
