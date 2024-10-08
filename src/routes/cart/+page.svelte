<script lang="ts">
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  import { superformToast, toast } from '$lib/component/Toasts.svelte'
  import { pb } from '$lib/pocketbase/pb.js'
  import type { LineItemResponse } from '$lib/pocketbase/pocketbase-types.js'
  import { states } from '$lib/util/data/states.js'
  import { formatCents } from '$lib/util/functions/formatCents'
  import { loadingButton } from '$lib/util/svelte-actions/loading-button'
  import { Form } from 'formsnap'
  import { writable } from 'svelte/store'
  import { slide } from 'svelte/transition'
  import {
    getCartTotal,
    getCartWeight,
    getLineItemPrice,
    validDiscount,
  } from '../../lib/util/functions/cartUtils'
  import CheckoutShippingCostEstimator from './__route/CheckoutShippingCostEstimator.svelte'
  import { CreateCheckoutSchema } from './schemas.js'
  import Icon from '@iconify/svelte'
  import { refreshCartItemCount } from '$lib/pocketbase/cart'
  import Dropdown from '$lib/component/Dropdown.svelte'

  export let data
  const cartItems = writable(data.cart.items)
  $: total = getCartTotal($cartItems, $validDiscount)
  async function updateQty(cartItemId: string, quantity: number) {
    if (quantity === 0) {
      await pb.collection('line_item').delete(cartItemId)
      cartItems.update((items) => items.filter((i) => i.id !== cartItemId))
    } else {
      await pb.collection('line_item').update(cartItemId, {
        quantity,
      } satisfies Partial<LineItemResponse>)
    }
    await refreshCartItemCount()
  }

  let requestShipment = false
  const discountsLoading = writable(false)
  async function applyDiscounts(code: string) {
    $discountsLoading = true
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
      $discountsLoading = false
    }
  }
  function inputKeypressHandler(discountCode?: string) {
    return function (e: KeyboardEvent) {
      if ((e as any).key === 'Enter' && !(e as any).ctrlKey) {
        e.stopPropagation()
        e.preventDefault()
        discountCode && applyDiscounts(discountCode)
      }
    }
  }
</script>

<div class="flex flex-col gap-3 w-full max-w-lg items-center m-auto px-2">
  <div class="prose mb-4 self-start">
    <h2>Cart</h2>
  </div>
  {#each $cartItems as cartItem (cartItem.id)}
    {@const product = cartItem.expand?.product}
    {#if product}
      <div class="flex gap-1 w-full" out:slide>
        <ImageThumb
          size={100}
          record={product}
          image={product.primaryImage}
          alt={product.title}
          class="rounded-sm"
        />
        <div class="flex-grow">
          <p class="font-bold">
            {product.title}
          </p>
          {#each Object.entries(cartItem.fields ?? {}) as [field, value]}
            <p class="text-sm">
              {field}:
              {value}
            </p>
          {/each}
        </div>

        <div class="flex flex-col items-end self-center">
          <select
            id="quantity-{cartItem.id}"
            class="select select-bordered select-sm p-0 pl-4 w-16"
            bind:value={cartItem.quantity}
            on:change={() => updateQty(cartItem.id, cartItem.quantity)}
          >
            {#each { length: Math.max(6, cartItem.quantity + 1) } as _, qty}
              <option value={qty}>{qty}</option>
            {/each}
          </select>
          <div class="relative">
            <p class="font-bold">
              {formatCents(getLineItemPrice(cartItem, false))}
            </p>
            {#if $validDiscount && product.teamPriceInCents !== undefined}
              <div
                class="absolute w-[120%] h-[2px] left-[-10%] top-1/2 transform -translate-y-1/2 bg-red-700 rotate-12"
              />
              <span class="absolute top-full text-red-700">
                {formatCents(getLineItemPrice(cartItem, true))}
              </span>
            {/if}
          </div>
        </div>

        <Dropdown>
          <svelte:fragment slot="trigger">
            <Icon icon="ph:dots-three-vertical-bold"></Icon>
          </svelte:fragment>
          <li>
            <button
              type="button"
              class="btn btn-ghost btn-sm text-error rounded-md flex-row flex-nowrap gap-1"
              on:click={() => updateQty(cartItem.id, 0)}
            >
              <Icon icon="mdi:delete"></Icon>
              <span>Delete</span>
            </button>
          </li>
        </Dropdown>
      </div>
    {/if}
  {:else}
    <p class="text-neutral-content">You have no items in your cart</p>
  {/each}
  <p class="self-end">
    <b>Total:</b> ${(total / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
  </p>
</div>
<div class="my-8"></div>
<Form.Root
  form={data.createCheckoutForm}
  schema={CreateCheckoutSchema}
  options={{ dataType: 'json', resetForm: false, onResult: superformToast() }}
  let:formValues
  let:form
  let:config
  class="flex flex-col w-full max-w-lg px-2 gap-2 m-auto"
>
  <Form.Field {config} name="discountCode" let:handlers>
    <Form.Label>Discount Code</Form.Label>
    <div class="flex gap-1 items-center">
      <input
        type="text"
        class="input input-bordered"
        placeholder="Discount Code"
        autocomplete="off"
        disabled={$discountsLoading}
        on:keypress={inputKeypressHandler(formValues.discountCode)}
        on:input={handlers.input}
      />
      <button
        type="button"
        class="btn btn-primary"
        use:loadingButton={discountsLoading}
        disabled={!formValues.discountCode}
        on:click={() =>
          formValues.discountCode && applyDiscounts(formValues.discountCode)}
        >Apply</button
      >
    </div>
  </Form.Field>
  <label
    for="requestShipment"
    class="prose col-span-full flex items-center gap-1 cursor-pointer"
  >
    <input
      class="checkbox checkbox-primary checkbox-sm rounded-md"
      id="requestShipment"
      type="checkbox"
      bind:checked={requestShipment}
      on:change={() =>
        form.form.update(($form) => ({
          ...$form,
          shippingAddress: requestShipment
            ? {
                state: 'AR',
                city: '',
                line1: '',
                line2: '',
                postal_code: '',
              }
            : undefined,
        }))}
    />
    <span>Request Shipment</span>
  </label>
  {#if formValues.shippingAddress}
    <div class="w-full grid grid-cols-5" transition:slide={{ duration: 200 }}>
      <Form.Field {config} name="shippingAddress.line1">
        <div class="col-span-full grid">
          <Form.Label>Address 1</Form.Label>
          <Form.Input
            class="input input-bordered"
            placeholder="Address 1"
            autocomplete="address-line1"
          />
          <Form.Validation />
        </div>
      </Form.Field>
      <Form.Field {config} name="shippingAddress.line2">
        <div class="col-span-full grid">
          <Form.Label>Address 2</Form.Label>
          <Form.Input
            class="input input-bordered"
            placeholder="Address 2"
            autocomplete="address-line2"
          />
          <Form.Validation />
        </div>
      </Form.Field>
      <Form.Field {config} name="shippingAddress.city">
        <div class="col-span-3 grid pr-2">
          <Form.Label>City</Form.Label>
          <Form.Input
            class="input input-bordered w-full"
            placeholder="City"
            autocomplete="city locality"
          />
          <Form.Validation />
        </div>
      </Form.Field>
      <Form.Field {config} name="shippingAddress.state" let:handlers>
        <div class="col-span-2 grid">
          <Form.Label>State</Form.Label>
          <select
            autocomplete="state province"
            class="select select-bordered"
            value={formValues.shippingAddress.state}
            on:change={handlers.select}
          >
            {#each states as state}
              <option value={state}>{state}</option>
            {/each}
          </select>
          <Form.Validation />
        </div>
      </Form.Field>
      <Form.Field {config} name="shippingAddress.postal_code">
        <div class="col-span-full grid">
          <Form.Label>Zip Code</Form.Label>
          <Form.Input
            class="input input-bordered"
            placeholder="Zip Code"
            autocomplete="postal-code"
          />
          <Form.Validation />
        </div>
      </Form.Field>
      <CheckoutShippingCostEstimator
        shippingAddress={formValues.shippingAddress}
        weightInOz={getCartWeight($cartItems)}
      />
    </div>
  {/if}
  <div class="flex flex-col items-end w-full gap-2">
    <button
      type="submit"
      class="btn btn-primary"
      disabled={!$cartItems.length}
      use:loadingButton={form.submitting}
    >
      Go to Payment
    </button>
    <span class="text-gray-400 w-[200px] text-right"
      >You will be directed to send payment to 1972 Ultimate Alumni Club, our
      nonprofit</span
    >
  </div>
</Form.Root>
