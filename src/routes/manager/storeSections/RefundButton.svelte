<script lang="ts">
  import { toast } from '$lib/component/Toasts.svelte'
  import { formatCents } from '$lib/util/functions/formatCents'
  import { loadingButton } from '$lib/util/svelte-actions/loading-button'
  import { writable } from 'svelte/store'
  import type { tableRow } from './+page'

  export let orderLineItem: tableRow

  let refundProcessed = orderLineItem?.refunded
  const refundProcessing = writable(false)
  let modalRef: HTMLDialogElement

  async function processRefund() {
    if (orderLineItem.refunded) {
      refundProcessed = true
      return
    }
    refundProcessing.set(true)
    try {
      const resp = await fetch(
        `/api/orderLineItem/${orderLineItem.id}/refund`,
        { method: 'POST' },
      )
      if (resp.status != 200) {
        const { message } = await resp.json()
        toast({ type: 'error', message })
      } else {
        refundProcessed = true
        modalRef?.close()
        toast({ type: 'success', message: 'Refund successful' })
      }
    } finally {
      refundProcessing.set(false)
    }
  }
</script>

<button
  type="button"
  class="btn btn-sm"
  disabled={refundProcessed}
  on:click={() => {
    modalRef?.showModal()
  }}
>
  Refund
</button>
<dialog class="modal" bind:this={modalRef}>
  <div class="modal-box">
    <h3 class="text-lg font-bold">Are you sure?</h3>
    <p class="py-4">
      <strong
        >{orderLineItem.expand?.order.expand?.user.name ??
          'This customer'}</strong
      >
      will be refunded <strong>{formatCents(orderLineItem.totalCents)}</strong>.
      This action cannot be undone.
    </p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Cancel</button>
      </form>
      <button
        type="button"
        class="btn btn-primary"
        disabled={refundProcessed}
        use:loadingButton={refundProcessing}
        on:click={processRefund}
      >
        Confirm
      </button>
    </div>
  </div>
</dialog>
