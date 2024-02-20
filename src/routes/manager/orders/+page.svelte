<script lang="ts">
  import { enhance } from '$app/forms'
  import Icon from '@iconify/svelte'

  export let data

  $: fields = [
    ...new Set(data.orders.flatMap((x) => Object.keys(x.fields ?? {}))),
  ]
  $: shownFields = [...fields]

  let loading: string[] = []
</script>

<form method="GET">
  <input
    class="input input-bordered"
    name="q"
    type="search"
    placeholder="Search"
  />
  <submit class="btn">Go</submit>
</form>

<div class="my-4">
  <p class="text-xl font-semibold">Shown Fields</p>
  <div class="flex flex-col gap-2">
    {#each fields as field}
      {@const checked = shownFields.includes(field)}
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
            (shownFields = checked
              ? shownFields.filter((x) => x !== field)
              : [...shownFields, field])}
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
          <th>Received</th>
          <th>Fulfilled</th>
          <td>Order</td>
          <th>User</th>
          <th>Product</th>
          <th>Quantity</th>
          {#each shownFields as field}
            <td>{field}</td>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each data.orders as lineItem (lineItem.id)}
          <tr>
            <td>
                <form
                  action="?/markReceived"
                  method="POST"
                  use:enhance={() => {
                    loading = [...loading, lineItem.id]
                    return async ({ update }) => {
                      await update()
                      loading = loading.filter((x) => x !== lineItem.id)
                    }
                  }}
                >
                  <input type="hidden" name="id" value={lineItem.id} />
                  <div class="w-full h-full grid place-items-center">
                    {#if loading.includes(lineItem.id)}
                      <Icon icon="mdi:loading" class="animate-spin" />
                    {:else}
                      <input
                        type="checkbox"
                        name="received"
                        id="{lineItem.id}-submit"
                        class="checkbox"
                        checked={lineItem.received}
                        on:change={(e) => e.currentTarget.form?.requestSubmit()}
                      />
                    {/if}
                  </div>
                </form>
              </td>
            <td>
              <form
                action="?/markFulfilled"
                method="POST"
                use:enhance={() => {
                  loading = [...loading, lineItem.id]
                  return async ({ update }) => {
                    await update()
                    loading = loading.filter((x) => x !== lineItem.id)
                  }
                }}
              >
                <input type="hidden" name="id" value={lineItem.id} />
                <div class="w-full h-full grid place-items-center">
                  {#if loading.includes(lineItem.id)}
                    <Icon icon="mdi:loading" class="animate-spin" />
                  {:else}
                    <input
                      type="checkbox"
                      name="fulfilled"
                      id="{lineItem.id}-submit"
                      class="checkbox"
                      checked={lineItem.fulfilled}
                      on:change={(e) => e.currentTarget.form?.requestSubmit()}
                    />
                  {/if}
                </div>
              </form>
            </td>
            <td>
              <a href="/orders/{lineItem.order}">
                <Icon icon="lets-icons:order" class="text-2xl" />
              </a>
            </td>
            <td>{lineItem.expand?.order.expand?.user.name}</td>
            <td>{lineItem.expand?.product.title}</td>
            <td>{lineItem.quantity}</td>
            {#each shownFields as field}
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
