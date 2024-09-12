<script lang="ts">
  import OrderComponent from '$lib/component/order/OrderComponent.svelte'

  export let data
</script>

<div class="max-w-lg m-auto flex flex-col gap-2">
  <h2 class="font-semibold text-lg">Orders</h2>
  {#each data.orders.items as order, i (order.id)}
    <OrderComponent {order} />
  {:else}
    <p class="text-neutral-content">You have no orders right now</p>
  {/each}
</div>
