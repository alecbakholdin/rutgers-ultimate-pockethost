<script lang="ts">
  import OrderManagerRow from './__route/OrderManagerRow.svelte';

  import { formatCents } from '$lib/util/functions/formatCents.js'
  import Icon from '@iconify/svelte'

  export let data
  $: orders = data.orders
</script>

<div class="mx-auto">
  <h2 class="text-lg font-semibold">Order Manager</h2>
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Name</th>
          <th>Shipping</th>
          <th>Fulfilled</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each orders.items as order}
          <OrderManagerRow {order}></OrderManagerRow>
        {/each}
      </tbody>
      <tfoot>
        <div class="join"></div>
      </tfoot>
    </table>
  </div>
</div>
