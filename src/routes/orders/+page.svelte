<script lang="ts">
  import DebugObject from '$lib/component/DebugObject.svelte'
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  import { shortMonths } from '$lib/util/data/months.js'
  import { formatCents } from '$lib/util/functions/formatCents.js'
  import Icon from '@iconify/svelte'
  import { slide } from 'svelte/transition'

  export let data
  export let expandedIdx: number | undefined = undefined
</script>

<div class="max-w-lg m-auto flex flex-col gap-2">
  {#each data.orders.items as order, i (order.id)}
    {@const createdDate = new Date(order.created)}
    {@const fulfilledDate = order.fulfilled
      ? new Date(order.fulfilled).toDateString()
      : 'Unfulfilled'}
    {@const lineItems = order.expand?.['order_line_item(order)'] || []}
    <button
      type="button"
      class="w-full shadow-lg rounded-xl p-4 grid grid-cols-[auto_auto_1fr] gap-2"
      on:click={() => (expandedIdx = expandedIdx !== i ? i : undefined)}
    >
      <div>
        <div
          class="bg-base-200 w-[40px] h-[40px] rounded-md flex flex-col items-center text-sm font-semibold"
        >
          <p>{shortMonths[createdDate.getMonth()]}</p>
          <p>{createdDate.getDate()}</p>
        </div>
        <div
          class="mt-2 border w-[40px] h-[40px] rounded-md flex flex-col items-center text-sm font-semibold"
        >
          <p>{lineItems.length}</p>
          <p class="text-xs">Items</p>
        </div>
      </div>
      <div class="btn btn-circle btn-sm" class:rotate-180={expandedIdx !== i}>
        <Icon
          icon="tabler:chevron-up"
          class="transition-all text-base-content"
        />
      </div>
      <div class="text-sm text-left">
        <div class="flex items-center w-fit gap-1">
          <Icon icon="mdi:dollar" />
          <p>{formatCents(order.total, { excludeDollar: true })}</p>
        </div>
        <div class="flex items-center w-fit gap-1">
          <Icon icon="mdi:done" />
          <p>{fulfilledDate}</p>
        </div>
        {#if order.shippingAddress && order.shippingCostInCents}
          {@const addr = order.shippingAddress}
          <div class="flex items-center w-fit border p-1 rounded-md mt-2">
            <Icon icon="material-symbols:local-shipping" class="text-3xl" />
            <div>
              <p>{addr.line1}</p>
              <p>{addr.line2}</p>
              <p>{addr.city}, {addr.state} {addr.postal_code}</p>
              <p>{formatCents(order.shippingCostInCents)}</p>
            </div>
          </div>
        {/if}
      </div>

      {#if expandedIdx === i}
        <div class="flex flex-col col-span-full gap-2" transition:slide>
          {#each lineItems as lineItem (lineItem.id)}
            {@const product = lineItem.expand?.product}
            {#if product}
              <div class="flex gap-2">
                <ImageThumb
                  record={product}
                  alt={product.title}
                  image={product.primaryImage}
                  size={100}
                  class="rounded-sm"
                />
                <div class="flex-grow text-left">
                  <p class="font-semibold">{product.title}</p>
                  {#each Object.entries(lineItem.fields || {}) as [key, value]}
                    <p>{key}: {value}</p>
                  {/each}
                </div>
                <p class="font-semibold text-sm self-center">
                  {formatCents(lineItem.totalCents)}
                </p>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </button>
  {/each}
</div>
