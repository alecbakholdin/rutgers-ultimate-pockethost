<script lang="ts">
  import { applyAction } from '$app/forms'
  import { superformToast } from '$lib/component/Toasts.svelte'
  import { pb } from '$lib/pocketbase/pb'
  import { loadingButton } from '$lib/util/svelte-actions/loading-button'
  import { Form } from 'formsnap'
  import { RegisterAccountSchema } from './schemas.js'

  export let data
</script>

<Form.Root
  method="POST"
  class="card max-w-xl mx-auto"
  options={{
    onResult: superformToast({
      onRedirect: async (result) => {
        pb.authStore.loadFromCookie(document.cookie)
        await applyAction(result)
      },
    }),
  }}
  form={data.registerForm}
  schema={RegisterAccountSchema}
  let:config
  let:form
>
  <h1 class="text-2xl mb-8">Register</h1>
  <div class="form-control gap-2 mb-4">
    <Form.Field {config} name="name">
      <Form.Input
        type="name"
        name="name"
        placeholder="First Name"
        autocomplete="given-name"
        class="input input-bordered"
      />
      <Form.Validation />
    </Form.Field>
    <Form.Field {config} name="email">
      <Form.Input
        type="email"
        name="email"
        placeholder="Email"
        autocomplete="email"
        class="input input-bordered"
      />
      <Form.Validation />
    </Form.Field>
    <Form.Field {config} name="password">
      <Form.Input
        type="password"
        name="password"
        placeholder="Password"
        autocomplete="new-password"
        class="input input-bordered"
      />
      <Form.Validation />
    </Form.Field>
    <Form.Field {config} name="passwordConfirm">
      <Form.Input
        type="password"
        name="passwordConfirm"
        placeholder="Confirm password"
        autocomplete="new-password"
        class="input input-bordered"
      />
      <Form.Validation />
    </Form.Field>
    <button class="btn btn-primary" use:loadingButton={form.submitting}>
      Register
    </button>
  </div>
</Form.Root>
