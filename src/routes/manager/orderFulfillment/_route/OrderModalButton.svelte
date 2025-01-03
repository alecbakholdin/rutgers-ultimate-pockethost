<script lang="ts">
  import OrderComponent from '$lib/component/order/OrderComponent.svelte'
  import type { FullOrderResponse } from '$lib/pocketbase/derived-pocketbase-types'
  import Icon from '@iconify/svelte'

  export let order: FullOrderResponse | undefined

  let modal: HTMLDialogElement
</script>

<button class="btn btn-icon" on:click={() => modal?.showModal()}>
  <Icon icon="lets-icons:order" class="text-2xl" />
</button>

{#if order}
  <dialog class="modal" bind:this={modal}>
    <div class="modal-box p-0">
        <OrderComponent {order} expanded />
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
{/if}
