<script lang="ts">
  import type { FullOrderResponse } from '$lib/pocketbase/derived-pocketbase-types'
  import { formatCents } from '$lib/util/functions/formatCents.js'
  import Icon from '@iconify/svelte'
  import { slide } from 'svelte/transition'

  export let order: FullOrderResponse
  $: user = order.expand!.user
  $: lineItems = order.expand!['order_line_item(order)']
  let expanded = false
</script>

<tr>
  <td>
    <a href="/manager/orders/{order.id}" class="badge badge-ghost">
      {order.id}
    </a>
  </td>
  <td>
    <a href="/manager/users/{user.id}" class="badge badge-ghost">
      {user.email}
    </a>
  </td>
  <td>{user?.name}</td>
  <td>{order.shippingCostInCents ? 'Yes' : 'No'}</td>
  <td>{order.fulfilled ? 'Yes' : 'No'}</td>
  <td>{formatCents(order.totalInCents)}</td>
  <td>
    <button
      type="button"
      class="btn btn-sm btn-circle"
      class:rotate-180={expanded}
      on:click={() => (expanded = !expanded)}
    >
      <Icon icon="mdi:chevron-down"></Icon>
    </button>
  </td>
</tr>
{#if expanded}
  <tr transition:slide>
    <td colspan="100">
      <table class="table max-w-lg ml-auto mr-16">
        <thead>
          <tr>
            <th>Title</th>
            <th>Unit Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        {#each lineItems as lineItem}
          <tr>
            <td class="col-span-3 columns-3">
              {lineItem.expand?.product.title}
            </td>
            <td>{formatCents(lineItem.unitPriceCents)}</td>
            <td>{lineItem.quantity}</td>
            <td>{formatCents(lineItem.totalCents)}</td>
          </tr>
        {/each}
        {#if order.shippingCostInCents}
          <tr>
            <td>Shipping</td>
            <td></td>
            <td></td>
            <td>{formatCents(order.shippingCostInCents)}</td>
          </tr>
        {/if}
      </table>
    </td>
  </tr>
{/if}
