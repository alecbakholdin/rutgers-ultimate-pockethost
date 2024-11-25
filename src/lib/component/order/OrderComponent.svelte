<script lang="ts">
  import type { FullOrderResponse } from '$lib/pocketbase/derived-pocketbase-types'
  import { shortMonths } from '$lib/util/data/months'
  import { formatCents } from '$lib/util/functions/formatCents'
  import Icon from '@iconify/svelte'
  import _ from 'lodash'
  import { createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import ImageThumb from '../ImageThumb.svelte'

  export let order: FullOrderResponse
  export let expanded = false
  export let showAdminControls: boolean | undefined = false
  const dispatch = createEventDispatcher<{ expand: void }>()

  $: orderFulfilled = !order.expand?.['order_line_item(order)']?.find(
    (x) => !x.fulfilled,
  )
  $: createdDate = new Date(order.created)
  $: fulfillIcon = orderFulfilled ? 'mdi:done' : 'mdi:remove'
  $: fulfilledDate = orderFulfilled ? 'Fulfilled' : 'Unfulfilled'
  $: numItems = _.sumBy(lineItems, 'quantity')
  $: lineItems = order.expand?.['order_line_item(order)'] || []
</script>

<button
  type="button"
  class="w-full bg-base-100 border rounded-xl p-4 grid grid-cols-[auto_1fr] gap-x-2 gap-y-4"
  on:click={() => {
    expanded = !expanded
    expanded && dispatch('expand')
  }}
>
  <div
    class="btn btn-circle btn-sm place-self-center"
    class:rotate-180={!expanded}
  >
    <Icon icon="tabler:chevron-up" class="transition-all text-base-content" />
  </div>
  <div class="flex gap-2 items-center">
    <div
      class="bg-base-200 w-[40px] h-[40px] rounded-md flex flex-col items-center text-sm font-semibold p-[2.5px]"
    >
      <p class="m-0 p-0">{createdDate.getDate()}</p>
      <p class="text-xs m-[-3px]">{shortMonths[createdDate.getMonth()]}</p>
    </div>
    <p class="font-semibold flex-grow text-end">
      {formatCents(order.totalInCents)}
    </p>
    {#if showAdminControls}
      <button
        type="button"
        class="btn btn-ghost btn-xs btn-circle"
        on:click|stopPropagation={() => {}}
      >
        <Icon icon="ph:dots-three-vertical-bold" class="flex-shrink text-lg" />
      </button>
    {/if}
  </div>
  <div />
  <div class="text-sm text-left flex gap-3">
    <div>
      {#each [[fulfillIcon, fulfilledDate], ['ant-design:number-outlined', `${numItems} items`]] as [icon, text]}
        <div class="flex items-center w-fit gap-1">
          <Icon {icon} />
          <p>{text}</p>
        </div>
      {/each}
      <!-- <div class="flex items-center w-fit gap-1">
            <Icon icon="tabler:number" />
            <p class="text">{order.id}</p>
          </div> -->
    </div>
    {#if order.shippingAddress && order.shippingCostInCents}
      {@const addr = order.shippingAddress}
      <div class="flex gap-1 items-start">
        <Icon icon="mdi:location" class="pt-1 text-lg flex-shrink-0" />
        <div>
          <p>{addr.line1}</p>
          <p>{addr.line2 ?? ''}</p>
          <p>{addr.city}, {addr.state} {addr.postal_code}</p>
        </div>
      </div>
    {/if}
  </div>

  {#if expanded}
    <div class="flex flex-col col-span-full gap-2" transition:slide>
      <div class="divider !h-[1.5px] mb-4 mt-0"></div>
      {#each lineItems as lineItem (lineItem.id)}
        {@const product = lineItem.expand?.product}
        {#if product}
          <div class="flex gap-2">
            <div class="flex flex-col justify-center">
              {#if lineItem.fulfilled}
                <Icon icon="mdi:check" />
              {:else}
                <Icon icon="mdi:remove" />
              {/if}
            </div>
            <ImageThumb
              record={product}
              alt={product.title}
              image={product.primaryImage}
              size={100}
              class="rounded-sm flex-shrink-0"
            />
            <div
              class="grid grid-cols-[1fr_auto] place-items-start h-fit w-full"
            >
              <p class="font-semibold text-sm text-left">
                {lineItem.quantity} x {product.title}
              </p>
              <p class="font-semibold text-sm place-self-start">
                {formatCents(lineItem.totalCents)}
              </p>
              {#each Object.entries(lineItem.fields || {}) as [key, value]}
                <p class="col-span-full text-xs">{key}: {value}</p>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
      {#if order.shippingCostInCents}
        <div class="divider !h-[1.5px] mt-4"></div>
        <div class="flex gap-2 w-full items-center mb-2">
          <div class="w-[100px] flex-shrink-0 flex justify-center">
            <Icon icon="material-symbols:local-shipping" class="text-3xl" />
          </div>
          <p class="font-semibold flex-grow text-start">Shipping</p>
          <p class="font-semibold text-sm">
            {formatCents(order.shippingCostInCents)}
          </p>
        </div>
      {/if}
    </div>
  {/if}
</button>
