<script lang="ts">
  import OrderComponent from '$lib/component/order/OrderComponent.svelte'

  export let data
</script>

{#if !data.order}
  Order not found
{:else}
  <OrderComponent order={data.order} />
{/if}
