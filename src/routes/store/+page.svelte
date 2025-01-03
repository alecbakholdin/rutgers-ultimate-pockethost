<script lang="ts">
  import BannerText from '$lib/component/BannerText.svelte'
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  import { toast } from '$lib/component/Toasts.svelte'
  import { validDiscount } from '$lib/util/functions/cartUtils.js'
  import { formatCents } from '$lib/util/functions/formatCents'
  import { Form } from 'formsnap'
  import { writable } from 'svelte/store'
  import _ from 'lodash'
  import { CreateDiscountCodeSchema } from './schemas.js'
  import { superValidate } from 'sveltekit-superforms/server'
  import Icon from '@iconify/svelte'

  export let data
  export let form

  const discountsLoading = writable(false)

  //wait for valid discount code schema to load
  export async function load() {
    const form = await superValidate(CreateDiscountCodeSchema)

    return { form }
  }

  //handle logic for applying discounts, then update validDiscount which renders the discount
  async function applyDiscounts(code: string) {
    discountsLoading.set(true)
    try {
      const response = await fetch(`/api/teamDiscount?code=${code}`, {
        credentials: 'include',
      })
      if (response.status === 200) {
        $validDiscount = true
        toast({ message: 'Discount applied', type: 'success' })
      } else {
        const data = await response.json()
        console.error(data)
        toast({ message: data.message, type: 'error' })
        $validDiscount = false
      }
    } finally {
      discountsLoading.set(false)
    }
  }

  //handle keypress event for input field
  function inputKeypressHandler(discountCodeValue?: string) {
    return function (e: KeyboardEvent) {
      if (e.key === 'Enter' && !e.ctrlKey) {
        e.stopPropagation()
        e.preventDefault()
        if (discountCodeValue) {
          applyDiscounts(discountCodeValue)
        }
      }
    }
  }
</script>

<svelte:head>
  <title>Ultimate Store</title>
</svelte:head>
<div class="flex flex-col w-full max-w-lg gap-4 pl-4">
  <Form.Root
    {form}
    schema={CreateDiscountCodeSchema}
    options={{
      dataType: 'json',
      resetForm: false, // Keeps the field value after submission
    }}
    let:formValues
    let:config
    class="flex flex-col gap-2"
  >
    <Form.Field {config} name="discountCode" let:handlers>
      <Form.Label class="font-medium">Discount Code</Form.Label>
      <div class="flex items-center gap-2">
        <input
          type="text"
          class="input input-bordered flex-grow max-w-md"
          placeholder="Enter Discount Code"
          autocomplete="off"
          disabled={$discountsLoading}
          on:keypress={inputKeypressHandler(formValues.discountCode)}
          on:input={handlers.input}
        />
        <button
          type="button"
          class="btn btn-primary"
          disabled={!formValues.discountCode || $discountsLoading}
          on:click={() =>
            formValues.discountCode && applyDiscounts(formValues.discountCode)}
        >
          Apply
        </button>
      </div>
      <Form.Validation />
    </Form.Field>
  </Form.Root>
</div>
{#each data.sections as section}
  <div class="divider mt-16 first:mt-0 text-gray-400">{section.title}</div>
  {#if !section.enabled}
    <div class="px-2 mb-8">
      <div class="alert alert-warning max-w-lg mx-auto">
        <Icon icon="mdi:warning" class="text-xl" />
        This section is not visible to the public
      </div>
    </div>
  {/if}
  <div
    class="mx-auto grid grid-cols-2 md:grid-cols-3 place-items-center gap-2 max-w-[95vw]"
  >
    {#each _.sortBy(section.expand?.products ?? [], 'title') as product}
      <a class="max-w-[250px]" href="/store/product/{product.slug}">
        <figure
          class="product-image"
          data-flip-id="product-image-{product.primaryImage}"
        >
          <ImageThumb
            image={product.primaryImage}
            record={product}
            alt={product.title}
            class="w-[200px] h-[200px]"
          />
        </figure>

        <h4 class="font-semibold text-lg">{product.title}</h4>
        <div class="relative inline-flex items-center space-x-2">
          <p class="relative">
            {formatCents(product.priceInCents)}
            {#if $validDiscount && product.teamPriceInCents !== undefined}
              <div
                class="absolute w-full h-[2px] left-0 top-1/2 transform -translate-y-1/2 bg-red-700 rotate-12"
              />
            {/if}
          </p>
          {#if $validDiscount && product.teamPriceInCents !== undefined}
            <span class="text-red-700">
              {formatCents(product.teamPriceInCents)}
            </span>
          {/if}
        </div>
        {#if product.requiredForPlayers}
          <p class="text-error">* Required for Players</p>
        {/if}
      </a>
    {/each}
  </div>
{:else}
  <BannerText
    text={"We don't have anything to sell right now, but please check back later!"}
  />
{/each}
