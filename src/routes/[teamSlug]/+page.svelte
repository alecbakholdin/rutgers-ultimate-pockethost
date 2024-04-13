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
    import GameModal from './_route/GameModal.svelte'

  export let data

  let modal: HTMLDialogElement
  let modalGame: GameResponse

  function openDeletionModal(id: string) {
    ;(document.getElementById(id) as HTMLDialogElement)?.showModal()
  }
  function closeDeletionModal(id: string) {
    ;(document.getElementById(id) as HTMLDialogElement)?.close()
  }
</script>


<a
  href="/{data.team.slug}/statistics"
  data-sveltekit-preload-data="off"
  class="btn">Stats</a
>
<GameList team={data.team} />
<GameModal/>

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
