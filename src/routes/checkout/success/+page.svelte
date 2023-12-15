<script lang="ts">
  export let data
</script>

<div
  class="w-full py-8 mx-auto prose relative text-center flex flex-col items-center"
>
  <img
    src="/machine-nightshade.png"
    class="h-[60px] mb-0"
    alt="machine-nightshade"
  />
  <h2 class="text-center mt-4 font-semibold" style:color="#ff0000">
    Your order has been received
  </h2>
  <p>
    Thank you for your order. We will begin processing it right away.
    {#if data.order}
      You will receive an order confirmation email shortly at
      <strong>
        {data.order.expand?.user.email}
      </strong>
    {/if}
  </p>
</div>
