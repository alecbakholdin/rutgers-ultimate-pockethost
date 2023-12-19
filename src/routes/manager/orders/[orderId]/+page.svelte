<script lang="ts">
  import OrderComponent from '$lib/component/order/OrderComponent.svelte'

  export let data
</script>

<OrderComponent expanded={true} order={data.order} />
