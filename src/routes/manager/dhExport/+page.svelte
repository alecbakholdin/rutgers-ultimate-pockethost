<script lang="ts">
  import { goto } from '$app/navigation'

  export let data

  $: fieldNames = data.product.expand?.fields.map((f) => f.title) || []
</script>

<div class="mx-auto flex flex-col gap-2 max-w-screen">
  <select
    class="select select-bordered max-w-80"
    value={data.sectionId}
    on:change={(e) => goto(`?sectionId=${e.currentTarget.value}`)}
  >
    {#each data.storeSections as section (section.id)}
      <option value={section.id}>{section.title}</option>
    {/each}
  </select>
  <h2 class="text-lg font-semibold">{data.storeSection.title}</h2>
  <div
    role="tablist"
    class="tabs tabs-boxed"
    class:hidden={data.products.length > 6}
  >
    {#each data.products as product}
      <a
        role="tab"
        class="tab"
        class:tab-active={data.product.id === product.id}
        href="?sectionId={data.sectionId}&productId={product.id}"
        >{product.title}</a
      >
    {/each}
  </div>
  <select
    name="product"
    id="product-select"
    class="select select-bordered"
    class:hidden={data.products.length <= 6}
    value={data.product.id}
    on:change={(e) =>
      goto(`?sectionId=${data.sectionId}&productId=${e.currentTarget.value}`)}
  >
    {#each data.products as product}
      <option value={product.id}>
        {product.title}
      </option>
    {/each}
  </select>
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          {#each fieldNames as field}
            <td>{field}</td>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each data.productLineItems as lineItem}
          <tr>
            <td>{lineItem.expand?.order.expand?.user.name}</td>
            {#each fieldNames as field}
              <td>{lineItem.fields[field] ?? ''}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <div class="join"></div>
      </tfoot>
    </table>
  </div>
</div>
