<script lang="ts">
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  import { superformToast } from '$lib/component/Toasts.svelte'
  import { states } from '$lib/util/data/states.js'
  import { pb } from '$lib/pocketbase/pb.js'
  import type { LineItemResponse } from '$lib/pocketbase/pocketbase-types.js'
  import { loadingButton } from '$lib/util/svelte-actions/loading-button'
  import { Form } from 'formsnap'
  import { writable } from 'svelte/store'
  import { slide } from 'svelte/transition'
  import CheckoutShippingCostEstimator from './__route/CheckoutShippingCostEstimator.svelte'
  import { CreateCheckoutSchema } from './schemas.js'

  export let data
  const cartItems = writable(data.cart.items)
  $: total = $cartItems.reduce(
    (total, item) => total + item.expand!.product.priceInCents * item.quantity,
    0,
  )
  async function updateQty(cartItemId: string, quantity: number) {
    if (quantity === 0) {
      await pb.collection('line_item').delete(cartItemId)
      cartItems.update((items) => items.filter((i) => i.id !== cartItemId))
    } else {
      await pb.collection('line_item').update(cartItemId, {
        quantity,
      } satisfies Partial<LineItemResponse>)
    }
  }

  let requestShipment = false
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
          {#each Object.entries(cartItem.fields) as [field, value]}
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
          <p class="font-bold">
            ${((product.priceInCents / 100) * cartItem.quantity).toFixed(2)}
          </p>
        </div>
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
  <label for="requestShipment" class="prose col-span-full">
    <input
      class="checkbox checkbox-primary"
      id="reqeustShipment"
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
            class="input input-bordered"
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
      />
    </div>
  {/if}
  <div>
    <button
      type="submit"
      class="float-right btn btn-primary"
      disabled={!$cartItems.length}
      use:loadingButton={form.submitting}
    >
      Go to Payment
    </button>
  </div>
</Form.Root>
