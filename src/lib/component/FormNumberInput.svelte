<script lang="ts">
  import { getForm, getFormField } from 'formsnap'
  import type {
    FormInputProps,
    FormInputEvents,
    FormInputSlots,
  } from 'formsnap/dist/components/form-input.svelte'
  import { numberProxy } from 'sveltekit-superforms/client'

  type $$Props = Omit<FormInputProps, 'type'>
  type $$Events = FormInputEvents
  type $$Slots = FormInputSlots

  const formContext = getForm()
  const { actions, errors, attrStore, name } = getFormField()

  $: attrs = {
    'data-fs-select': '',
    'data-fs-error': $errors ? '' : void 0,
    ...$attrStore,
  }

  // @ts-ignore
  const numValue = numberProxy(formContext.form, name, {empty: "undefined", emptyIfZero: false})
</script>

<input
  {...$$restProps}
  use:actions.input
  {...attrs}
  type="number"
  bind:value={$numValue}
/>
