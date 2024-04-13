<script lang="ts">
  export let text: string
</script>

<div
  class="w-full py-8 mx-auto prose relative text-center flex flex-col items-center"
>
  <img
    src="/machine-nightshade.png"
    class="h-[60px] mb-0"
    alt="machine-nightshade"
  />
  <h2 class="text-center mt-4 font-semibold text-primary">{text}</h2>
</div>
