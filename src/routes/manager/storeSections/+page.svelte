<script lang="ts">
  import { formatCents } from '$lib/util/functions/formatCents'
  import { writable } from 'svelte/store'
  import RefundButton from './RefundButton.svelte'

  export let data

  const sectionId = writable(data.selectedSection?.id)
  sectionId.subscribe((value) => {
    if (typeof window === 'undefined') return
    if (window.location.search.includes(value)) return
    window.location.search = `?section_id=${value}`
  })

  const products = writable(new Set<string>())
  const fields = writable<string[]>([])
  function handleProductChange(e: { currentTarget: HTMLInputElement }) {
    products.update((p) => {
      e.currentTarget.checked
        ? p.add(e.currentTarget.id)
        : p.delete(e.currentTarget.id)
      const fieldSet = new Set(
        data.availableProducts
          .filter((product) => p.has(product.id))
          .flatMap((product) => product.expand?.fields.map((f) => f.title)),
      )
      fields.set(Array.from(fieldSet).filter((x) => x) as string[])
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
        <th>Refund</th>
        <th>Date</th>
        <th>Name</th>
        <th>Email</th>
        <th>Product</th>
        <th>Qty</th>
        {#each $fields as field}
          <th>{field}</th>
        {/each}
        <th>Paid</th>
      </tr>
    </thead>
    <tbody>
      {#each data.orderLineItems as lineItem}
        <tr class:hidden={$products.size && !$products.has(lineItem.product)}>
          <td><RefundButton orderLineItem={lineItem} /></td>
          <td>{lineItem.expand?.order.created.toLocaleString()}</td>
          <td>{lineItem.expand?.order.expand?.user.name}</td>
          <td>{lineItem.expand?.order.expand?.user.email}</td>
          <td>{lineItem.expand?.product.title}</td>
          <td>{lineItem.quantity}</td>
          {#each $fields as field}
            <td>{lineItem.fields?.[field] ?? ''}</td>
          {/each}
          <td>{formatCents(lineItem.totalCents)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
