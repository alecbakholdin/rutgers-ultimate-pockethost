<script lang="ts">
  import FormNumberInput from '$lib/component/FormNumberInput.svelte'
  import ImageThumb from '$lib/component/ImageThumb.svelte'
  import { superformToast } from '$lib/component/Toasts.svelte'
  import { loadingButton } from '$lib/util/svelte-actions/loading-button.js'
  import Icon from '@iconify/svelte'
  import { Form } from 'formsnap'
  import { getAddToCartSchema } from './schemas.js'
  import { formatCents } from '$lib/util/functions/formatCents.js'
  import {
    getProductFieldPriceIncrease,
    getUnitPriceWithFields,
  } from '$lib/util/functions/cartUtils.js'
  import { refreshCartItemCount } from '$lib/pocketbase/cart.js'
  import { getContrastColor } from '$lib/util/functions/getContrastColor.js'
  import { pb } from '$lib/pocketbase/pb.js'

  export let data
  data.addToCartForm.data.quantity = 1
  $: schema = getAddToCartSchema(data.product)
  $: product = data.product

  let currentImage = data.product.primaryImage
  function forceAny(input: any) {
    return input as any
  }
</script>

<svelte:head>
  <title>{product.title}</title>
  <meta property="og:title" content={product.title} />
  <meta
    property="og:image"
    content={pb.getFileUrl(product, product.primaryImage)}
  />
</svelte:head>

<div class="flex flex-col gap-4 md:flex-row max-w-md md:max-w-4xl mx-auto">
  <div class="flex-shrink-0 flex flex-col items-center">
    <figure class="product-image" data-flip-id="product-image-{currentImage}">
      <ImageThumb
        class="rounded-md w-[480px] h-[480px] aspect-square object-scale-down"
        record={product}
        image={currentImage}
        alt={product.title}
      />
    </figure>
    <div class="w-fit overflow-x-auto flex mt-2">
      {#if product.galleryImages.length !== 0}
        {#each [product.primaryImage, ...product.galleryImages].filter((x) => x) as image, i}
          <button
            type="button"
            on:click={() => (currentImage = image)}
            class="border-4 rounded-md flex-shrink-0 overflow-hidden"
            class:border-transparent={image !== currentImage}
            class:border-primary={image === currentImage}
            style="width: 120px; height: 120px;"
          >
            <ImageThumb
              class="rounded-md"
              record={product}
              {image}
              alt="{product.title}-{i}"
              size={120}
            />
          </button>
        {/each}
      {/if}
    </div>
  </div>

  <Form.Root
    options={{
      dataType: 'json',
      resetForm: false,
      onResult: superformToast({ onSuccess: refreshCartItemCount }),
    }}
    {schema}
    form={data.addToCartForm}
    let:config
    let:form
    let:formValues
    class="w-full"
  >
    <div class="w-full flex flex-col md:items-end prose max-w-md mx-auto">
      <h2 class="mb-2">{product.title}</h2>
      <h3 class="text-base-content m-0 p-0">
        {formatCents(getUnitPriceWithFields(product, formValues.fields))}
      </h3>
      {#if product.requiredForPlayers}
        <p class="text-error m-0 p-0">* Required for Players</p>
      {/if}

      <div class="flex flex-col gap-1 w-full md:max-w-[300px] max-w-full">
        {#each product.expand?.fields ?? [] as field, i}
          {@const name = `fields.${field.title}`}
          {@const label = `${field.title}${
            field.optional ? ' (optional)' : ''
          }`}
          {#if field.type === 'color'}
            <Form.Field {config} name={forceAny(name)} let:handlers>
              <span>{label}</span>
              <div class="flex gap-1">
                {#each field.expand?.colors ?? [] as color, j}
                  {@const id = `field-${i}-${j}`}
                  <label class="cursor-pointer" for={id}>
                    <div
                      class="w-10 h-10 relative grid place-items-center rounded-full border"
                      style:background-color={color.color}
                      style:color={getContrastColor(color.color)}
                    >
                      <input
                        class="hidden"
                        {id}
                        type="radio"
                        {name}
                        value={color.name}
                        on:change={handlers.radio}
                      />
                      <div class="selected-indicator">
                        <Icon icon="mdi:check" class="text-xl" />
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
              <Form.Validation />
            </Form.Field>
          {:else if field.type === 'options'}
            <Form.Field {config} name={forceAny(name)} let:handlers>
              <Form.Label for="field-{i}">{label}</Form.Label>
              <select
                id="field-{i}"
                class="select select-bordered"
                name={field.title}
                placeholder={field.title}
                value={undefined}
                on:change={handlers.select}
              >
                <option value={undefined} disabled selected class="hidden"
                  >{field.title}</option
                >
                {#each field.options
                  .split(',')
                  .map((val) => val.trim()) as value}
                  {@const priceIncrease = getProductFieldPriceIncrease(
                    field,
                    value,
                  )}
                  <option {value}>
                    {value}
                    {#if priceIncrease}(+{formatCents(priceIncrease)}){/if}
                  </option>
                {/each}
              </select>
              <Form.Validation />
            </Form.Field>
          {:else if field.type === 'text'}
            <Form.Field {config} name={forceAny(name)}>
              <Form.Label>{label}</Form.Label>
              <Form.Input
                class="input input-bordered"
                placeholder={field.title}
              />
              <Form.Validation />
            </Form.Field>
          {:else if field.type === 'number'}
            <Form.Field {config} name={forceAny(name)}>
              <Form.Label>{label}</Form.Label>
              <FormNumberInput
                class="input input-bordered"
                placeholder={field.title}
              />
              <Form.Validation />
            </Form.Field>
          {/if}
        {/each}

        <Form.Field {config} name="quantity">
          <Form.Label>Quantity</Form.Label>
          <FormNumberInput
            class="input input-bordered"
            inputmode="numeric"
            step="1"
            required
          />
          <Form.Validation />
        </Form.Field>
        <button
          type="submit"
          class="btn btn-primary mt-2"
          use:loadingButton={form.submitting}
        >
          Add To Cart
        </button>
      </div>
    </div>
  </Form.Root>
</div>

<style>
  .selected-indicator {
    visibility: hidden;
  }
  input:checked + .selected-indicator {
    visibility: visible;
  }
</style>
