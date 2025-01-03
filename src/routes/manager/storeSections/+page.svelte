<script lang="ts">
  import { formatCents } from '$lib/util/functions/formatCents'
  import { writable } from 'svelte/store'

  export let data

  const sectionId = writable(data.selectedSection?.id)
  sectionId.subscribe((value) => {
    if (typeof window === 'undefined') return
    if (window.location.search.includes(value)) return
    window.location.search = `?section_id=${value}`
  })

  const products = writable(new Set<string>())
  function handleProductChange(e: { target: HTMLInputElement }) {
    products.update((p) => {
      e.target.checked ? p.add(e.target.id) : p.delete(e.target.id)
      return p
    })
  }
</script>

<select
  name="section_id"
  id="section_id"
  class="select select-bordered"
  bind:value={$sectionId}
>
  {#each data.availableSections as section}
    <option value={section.id}>{section.title}</option>
  {/each}
</select>
<div class="p-4 flex gap-1 flex-wrap">
  {#each data.availableProducts as product}
    <label
      for={product.id}
      class="badge cursor-pointer text-nowrap"
      class:badge-primary={$products.has(product.id)}
    >
      {product.title} ({data.orderLineItems.filter(
        (l) => l.product === product.id,
      ).length})
      <input
        id={product.id}
        type="checkbox"
        name="product"
        class="hidden"
        on:change={handleProductChange}
      />
    </label>
  {/each}
</div>

<div class="overflow-x-auto">
  <table class="table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Name</th>
        <th>Email</th>
        <th>Product</th>
        <th>Qty</th>
        <th>Paid</th>
      </tr>
    </thead>
    <tbody>
      {#each data.orderLineItems as lineItem}
        <tr class:hidden={$products.size && !$products.has(lineItem.product)}>
          <td>{lineItem.expand?.order.created.toLocaleString()}</td>
          <td>{lineItem.expand?.order.expand?.user.name}</td>
          <td>{lineItem.expand?.order.expand?.user.email}</td>
          <td>{lineItem.expand?.product.title}</td>
          <td>{lineItem.quantity}</td>
          <td>{formatCents(lineItem.totalCents)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
