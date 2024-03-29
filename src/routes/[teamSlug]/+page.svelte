<script lang="ts">
  import { enhance } from '$app/forms'
  import { disableScrollHandling, goto, invalidateAll } from '$app/navigation'
  import { toast } from '$lib/component/Toasts.svelte'
  import { pb } from '$lib/pocketbase/pb'
  import type {
    GameRecord,
    GameResponse,
  } from '$lib/pocketbase/pocketbase-types'
  import Icon from '@iconify/svelte'
  import GameAdminForm from './_route/GameAdminForm.svelte'
  import GameList from './_route/GameList.svelte'

  export let data

  let modal: HTMLDialogElement
  let modalGame: GameResponse

  function openModal(game: GameResponse) {
    console.log('opening', game)
    if (!data.user?.isManager) return
    modalGame = game
    modal?.showModal()
  }

  function openDeletionModal(id: string) {
    ;(document.getElementById(id) as HTMLDialogElement)?.showModal()
  }
  function closeDeletionModal(id: string) {
    ;(document.getElementById(id) as HTMLDialogElement)?.close()
  }
</script>

<dialog class="modal" bind:this={modal}>
  <div class="modal-box">
    <div class="modal-top mb-4">
      <h3 class="text-2xl font-semibold">
        {data.team.name} vs {modalGame?.opponent}
      </h3>
    </div>
    <div class="modal-middle mb-4">
      {#if modalGame}
        <label for="opponent" class="label">Opponent</label>
        <input
          type="text"
          name="opponent"
          id="opponent"
          class="input input-bordered"
          bind:value={modalGame.opponent}
        />
      {/if}
    </div>
    <form method="dialog" class="flex flex-col gap-2">
      {#if data.team.live_game !== modalGame?.id}
        <button
          class="btn btn-primary w-full"
          on:click={async () => {
            await pb.collection('team').update(data.team.id, {
              live_game: modalGame.id,
            })
            goto(`/${data.team.slug}/live`)
          }}
        >
          Set Live
        </button>
      {:else}
        <button
          type="button"
          class="btn btn-error w-full"
          on:click={() =>
            pb.collection('team').update(data.team.id, {
              live_game: '',
            })}
        >
          Remove from Live
        </button>
      {/if}
      <button
        class="btn w-full btn-primary"
        on:click={() => {
          if (!modalGame) return
          const { id, ...rest } = modalGame
          pb.collection('game').update(id, rest)
        }}>Submit Changes</button
      >
      <button class="btn w-full">Close</button>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button class="cursor-default"></button>
  </form>
</dialog>
<a href="/{data.team.slug}/statistics" data-sveltekit-preload-data="off" class="btn">Stats</a>
<GameList team={data.team} {openModal} />

{#if data.user?.isManager}
  <GameAdminForm team={data.team} />

  <div class="mt-4">
    <span class="text-xl font-semibold mb-2">Roster</span>
    <div class="mx-2 w-full flex flex-col gap-2">
      {#each data.team.expand?.['player(team)'] || [] as player}
        {@const modalId = `deletion-modal-${player.id}`}
        <dialog class="modal" id={modalId}>
          <div class="modal-box">
            <h3 class="modal-top text-xl font-semibold">Are You Sure?</h3>
            <div class="modal-middle my-2">
              You are about to delete <b>{player.name}</b>. This action is
              unreversible. All stats may be lost.
            </div>
            <div class="modal-action">
              <form method="dialog">
                <button type="button" class="btn">Close</button>
              </form>
              <button
                type="button"
                class="btn btn-error bg-opacity-30"
                on:click={async () => {
                  await pb.collection('player').delete(player.id)
                  await invalidateAll()
                  closeDeletionModal(modalId)
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <form class="modal-backdrop cursor-default" method="dialog">
            <button></button>
          </form>
        </dialog>
        <div
          class="flex py-1 items-center border-b first:border-t border-gray-400"
        >
          <span class="flex-grow">{player.name}</span>
          <input type="hidden" name="playerId" value={player.id} />
          <button
            class="btn btn-circle btn-sm"
            on:click={() => openDeletionModal(modalId)}
            aria-label="delete {player.name}"
          >
            <Icon icon="mdi:remove" />
          </button>
        </div>
      {/each}
    </div>
    <p class="font-semibold mt-2">New Player</p>
    <form
      action="?/createPlayer"
      method="POST"
      class="flex gap-2"
      use:enhance={() =>
        async ({ result, update }) => {
          result.type === 'error' &&
            toast({ type: 'error', message: result.error?.message })
          result.type === 'failure' &&
            toast({ type: 'error', message: 'Error submitting form' })
          if (!['error', 'failure'].includes(result.type)) {
            await update()
          }
        }}
    >
      <input type="hidden" name="teamId" value={data.team.id} />
      <input
        type="text"
        name="name"
        id="createPlayerName"
        class="input input-bordered flex-grow block"
        placeholder="Player Name"
        aria-label="Player Name"
      />
      <button class="btn">+ Create</button>
    </form>
  </div>
{/if}
