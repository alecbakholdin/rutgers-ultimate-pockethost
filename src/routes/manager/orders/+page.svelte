<script lang="ts">
  import { enhance } from '$app/forms'
  import Icon from '@iconify/svelte'
  import { page } from '$app/stores'
  import _ from 'lodash'
    import { localStorageStore } from '$lib/util/localStorageStore.js'

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
  console.log(typeof fields)
  const shownFields = localStorageStore('managerOrdersShownFields', [] as string[])

  let receivedLoading: string[] = []
  let fulfilledLoading: string[] = []

  let sortBy: { field: string; asc: boolean } | undefined

  $: lineItems = sortBy
    ? (() => {
        const orders = [...data.orders]
        orders.sort((a, b) => {
          const valA = a.fields?.[sortBy!.field]?.trim() || ''
          const valB = b.fields?.[sortBy!.field]?.trim() || ''

          const numCompare =
            typeof valA === 'number' && typeof valB === 'number'
          const factor = sortBy!.asc ? 1 : -1
          return (
            factor *
            (numCompare
              ? parseFloat(valA) - parseFloat(valB)
              : valA.localeCompare(valB))
          )
        })
        return orders
      })()
    : data.orders
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
<div class="flex mt-4 gap-2">
  {#each previousSearches as search}
    <a href="?q={search}" class="badge badge-ghost badge-lg">
      {search}
    </a>
  {/each}
</div>

<div class="my-4">
  <p class="text-xl font-semibold">Shown Fields</p>
  <div class="flex flex-col gap-2">
    {#each fields as field}
      {@const checked = $shownFields.includes(field)}
      <label
        for="{field}-shown"
        class="flex flex-row items-center gap-2 border border-neutral-300 p-2 rounded-md cursor-pointer"
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
            <td>
              Actions
            </td>
            <td>
              <a href="/orders/{lineItem.order}">
                <Icon icon="lets-icons:order" class="text-2xl" />
              </a>
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
