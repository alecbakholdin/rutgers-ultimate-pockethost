<script lang="ts">
  import type { z } from 'zod'
  import type { CreateCheckoutSchema } from '../schemas'
  import _ from 'lodash'
  import type {
    CalculateShipmentSchema,
    CalculatedShipmentSchema,
  } from '../../api/shipment/calculate/schemas'
  import Icon from '@iconify/svelte'

  type ShippingAddress = z.infer<typeof CreateCheckoutSchema>['shippingAddress']
  export let shippingAddress: ShippingAddress
  let shippingAmount: string | undefined = undefined
  let shippingLoading = false
  const calculateShipping = _.debounce(async (address: ShippingAddress) => {
    try {
      if (!address) return
      console.log('Calculating shipping')
      const response = await fetch('/api/shipment/calculate', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          shippingAddress: address,
        } satisfies z.infer<typeof CalculateShipmentSchema>),
      })
      if (response.status !== 200) {
        console.error(response.status, await response.text())
      } else {
        const { cheapestShipmentInCents } =
          (await response.json()) as CalculatedShipmentSchema
        shippingAmount = (cheapestShipmentInCents/100).toFixed(2)
      }
    } finally {
      shippingLoading = false
    }
  }, 300)
  $: {
    shippingLoading = true
    shippingAmount = undefined
    calculateShipping(shippingAddress)
  }
</script>

<div class="col-span-full prose flex gap-1 items-center">
  <span>Estimated Shipping Cost: </span>
  {#if shippingLoading}
    <span>
      <Icon icon="mdi:loading" class="animate-spin" />
    </span>
  {:else}
    ${shippingAmount ?? '-'}
  {/if}
</div>
