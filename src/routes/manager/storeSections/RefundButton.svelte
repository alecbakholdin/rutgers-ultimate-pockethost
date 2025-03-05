<script lang="ts">
  import { toast } from '$lib/component/Toasts.svelte'
  import type { OrderLineItemResponseTyped } from '$lib/pocketbase/derived-pocketbase-types'
  import { loadingButton } from '$lib/util/svelte-actions/loading-button'
  import { writable } from 'svelte/store'

  export let orderLineItem: OrderLineItemResponseTyped

  let refundProcessed = orderLineItem.refunded
  const refundProcessing = writable(false)

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
  use:loadingButton={refundProcessing}
  on:click={processRefund}
>
  Refund
</button>
