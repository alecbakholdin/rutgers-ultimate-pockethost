<script lang="ts" context="module">
  type Status = z.infer<typeof OrderStatus>

  export function getOrderStatus(order: FullOrderResponse | undefined): Status {
    return order?.events?.findLast(Boolean)?.type ?? DefaultOrderStatus
  }

  const nextStatusMap: Record<Status, Status[]> = {
    Pending: ['Delivered', 'Label Created'],
    'Label Created': ['Shipped'],
    Shipped: ['Delivered'],
    Delivered: [],
  }
</script>

<script lang="ts">
  import type { FullOrderResponse } from '$lib/pocketbase/derived-pocketbase-types'
  import { DefaultOrderStatus, OrderStatus } from '$lib/schemas/orderEvent'
  import { z } from 'zod'

  export let order: FullOrderResponse | undefined
  const status = getOrderStatus(order)
</script>

<div class="flex gap-1">
  {#each nextStatusMap[status] as nextState}
    {#if nextState === 'Delivered'}
      <button type="button" class="btn btn-sm btn-primary">Deliver</button>
    {:else if nextState === 'Label Created'}
      <button type="button" class="btn btn-sm btn-primary">Label</button>
    {:else if nextState === 'Shipped'}
      <button type="button" class="btn btn-sm btn-primary">Ship</button>
    {/if}
  {/each}
</div>
