<script lang="ts">
  export let data

  $: fieldNames = data.product.expand?.fields.map((f) => f.title) || []
</script>

<div class="mx-auto flex flex-col gap-2">
  <h2 class="text-lg font-semibold">DH Products</h2>
  <div role="tablist" class="tabs tabs-boxed">
    {#each data.products as product}
      <a
        role="tab"
        class="tab"
        class:tab-active={data.product.id === product.id}
        href="?productId={product.id}">{product.title}</a
      >
    {/each}
  </div>
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
