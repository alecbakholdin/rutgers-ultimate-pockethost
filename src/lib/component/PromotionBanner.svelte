<script lang="ts">
  //props for promo banner
  export let title: string
  export let description: string
  export let buttonText: string
  export let buttonLink: string
  export let imageUrl: string
  export let imageAlt: string
</script>

<div
  class="store-promo-banner flex flex-col md:flex-row items-center bg-white shadow-lg p-4 sm:p-6 md:p-16"
  style="max-width: 1200px"
>
  <div class="text-section flex-1 mb-4 md:mb-0 text-center md:text-left">
    <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800">
      {title}
    </h2>
    <p class="mt-2 text-base sm:text-lg md:text-xl text-gray-600">
      {description}
    </p>
    <!-- idk how to make optional props in svelte so this is a workaround  -->
    {#if buttonText !== ''}
      <a
        href={buttonLink}
        class="inline-block w-1/2 mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium text-center transition duration-300 ease-in-out mx-auto md:mx-0"
      >
        {buttonText}
      </a>
    {/if}
  </div>

  <div class="image-section flex-1 mt-4 md:mt-0">
    <img
      src={imageUrl}
      alt={imageAlt}
      class="w-full h-auto rounded-lg shadow-md"
    />
  </div>
</div>

<style>
  .text-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .image-section img {
    object-fit: cover;
  }
</style>
