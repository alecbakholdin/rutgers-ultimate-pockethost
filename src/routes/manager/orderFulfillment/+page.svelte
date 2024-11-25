<script lang="ts">
  import { enhance } from '$app/forms'
  import Icon from '@iconify/svelte'
  import { page } from '$app/stores'
  import _ from 'lodash'
  import { localStorageStore } from '$lib/util/localStorageStore.js'
  import OrderModalButton from './_route/OrderModalButton.svelte'
  import { type OrderFulfillmentSortBy, sortedOrders } from './_route/sortBy'

  export let data

  let previousSearches: string[] = []
  $: searchStr = $page.url.searchParams.get('q')
  $: if (typeof window !== 'undefined') {
    const key = 'order_manager_order_search'
    const localData: string[] = JSON.parse(localStorage.getItem(key) || '[]')
    previousSearches = _.uniq(
      [searchStr || '', ...localData].filter((x) => x),
    ).slice(0, 5)
    localStorage.setItem(key, JSON.stringify(previousSearches))
    console.log(searchStr, previousSearches, localStorage.getItem(key))
  }

  $: fields = [
    ...new Set(data.orders.flatMap((x) => Object.keys(x.fields ?? {}))),
  ]
  const showFulfilledOrders = localStorageStore(
    'managerOrdersShowDeliveredOrders',
    false,
  )
  const shownFields = localStorageStore(
    'managerOrdersShownFields',
    [] as string[],
  )

  let receivedLoading: string[] = []
  let fulfilledLoading: string[] = []

  let sortBy: OrderFulfillmentSortBy | undefined = undefined

  $: lineItems = sortedOrders(data.orders, sortBy).filter(
    (o) =>
      $showFulfilledOrders ||
      !o.expand?.order?.events?.find((e) => e.type == 'Delivered'),
  )
</script>

<!-- svelte-ignore missing-declaration -->
<form method="GET">
  <input
    class="input input-bordered"
    name="q"
    type="search"
    placeholder="Search"
  />
  <button type="submit" class="btn">Go</button>
</form>
<div class="space-y-1">
  <p class="text-neutral-content">Previous searches</p>
  <div class="flex gap-2">
    {#each previousSearches as search}
      <a href="?q={search}" class="badge badge-ghost badge-lg">
        {search}
      </a>
    {/each}
  </div>
</div>

<div class="mt-4 mb-8 space-y-1">
  <p class="text-xl font-semibold">Options</p>
  <div>
    <label for="showFulfilledOrders" class="label flex justify-start flex-nowrap gap-2">
      <input
        type="checkbox"
        id="showFulfilledOrders"
        class="checkbox"
        bind:checked={$showFulfilledOrders}
      />
      <span>Show fulfilled orders</span>
    </label>
  </div>
  <p class="text-xl font-semibold">Fields</p>
  <div class="flex flex-wrap gap-2">
    {#each fields as field}
      {@const checked = $shownFields.includes(field)}
      <label
        for="{field}-shown"
        class="flex flex-row items-center gap-2 p-2 rounded-md cursor-pointer whitespace-nowrap"
      >
        <input
          class="checkbox rounded-md"
          type="checkbox"
          name={field}
          id="{field}-shown"
          on:change={() =>
            ($shownFields = checked
              ? $shownFields.filter((x) => x !== field)
              : [...$shownFields, field])}
          {checked}
        />
        <span>{field}</span>
      </label>
    {/each}
  </div>
  <hr/>
</div>

{#if !data.orders.length}
  <p class="text-neutral">Please enter a search term</p>
{:else}
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>Actions</th>
          <th>Status</th>
          <th>Order</th>
          <th>User</th>
          <th>Product</th>
          <th>Quantity</th>
          {#each $shownFields as field}
            <td>
              <button
                class="flex flex-row items-center w-full"
                type="button"
                on:click={() => {
                  if (!sortBy || sortBy.field !== field) {
                    sortBy = { field, asc: true }
                  } else if (sortBy.asc) {
                    sortBy = { field, asc: false }
                  } else {
                    sortBy = undefined
                  }
                }}
              >
                {#if sortBy?.field === field}
                  {#if sortBy.asc}
                    <Icon icon="mdi:chevron-up" />
                  {:else}
                    <Icon icon="mdi:chevron-down" />
                  {/if}
                {/if}
                {field}
              </button>
            </td>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each lineItems as lineItem (lineItem.id)}
          <tr>
            <td> Actions </td>
            <td> </td>
            <td>
              <OrderModalButton order={lineItem.expand?.order} />
            </td>
            <td>{lineItem.expand?.order.expand?.user.name}</td>
            <td>{lineItem.expand?.product.title}</td>
            <td>{lineItem.quantity}</td>
            {#each $shownFields as field}
              <td>{lineItem.fields?.[field] ?? ''}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <div class="join"></div>
      </tfoot>
    </table>
  </div>
{/if}
