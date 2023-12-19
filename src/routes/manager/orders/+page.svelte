<script lang="ts">
    import { formatCents } from '$lib/util/functions/formatCents.js'

  export let data
  $: orders = data.orders
</script>

<div class="mx-auto">
  <h2 class="text-lg font-semibold">Order Manager</h2>
  <div class="overflow-x-auto">
    <table class="table table-pin-rows">
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Name</th>
          <th>Shipping</th>
          <th>Fulfilled</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {#each orders.items as order}
          {@const user = order.expand?.user}
          <tr>
            <td>
              <a href="/manager/orders/{order.id}" class="badge badge-ghost">
                {order.id}
              </a>
            </td>
            <td>
              <a href="/manager/users/{user?.id}" class="badge badge-ghost">
                {user?.email}
              </a>
            </td>
            <td>{user?.name}</td>
            <td>{order.shippingCostInCents ? "Yes" : "No"}</td>
            <td>{order.fulfilled ? "Yes" : "No"}</td>
            <td>{formatCents(order.totalInCents)}</td>
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <div class="join">
            
        </div>
      </tfoot>
    </table>
  </div>
</div>
