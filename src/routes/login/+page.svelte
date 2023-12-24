<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import { superformToast } from '$lib/component/Toasts.svelte'
  import { pb } from '$lib/pocketbase/pb'
  import { loadingButton } from '$lib/util/svelte-actions/loading-button'
  import Icon from '@iconify/svelte'
  import { Form } from 'formsnap'
  import { writable } from 'svelte/store'
  import { LoginWithPasswordSchema } from './schemas.js'

  export let data
  const loading = writable(false)

  function signInWithGoogle() {
    let w = window.open()
    pb.collection('users').authWithOAuth2({
      provider: 'google',
      urlCallback: (url) => {
        if (w) {
          w.location.href = url
        }
      },
    }).then(() => goto('/'))

    goto('/')
  }
</script>

<div class="max-w-md mx-auto">
  <Form.Root
    method="POST"
    options={{
      onResult: superformToast({
        onRedirect: async (result) => {
          pb.authStore.loadFromCookie(document.cookie)
          await applyAction(result)
        },
      }),
    }}
    form={data.loginForm}
    schema={LoginWithPasswordSchema}
    let:config
    let:form
  >
    <h1 class="text-2xl mb-8">Log in</h1>
    <div class="form-control gap-2 mb-4">
      <Form.Field {config} name="email">
        <Form.Label class="hidden">Email</Form.Label>
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
        <Form.Label class="hidden">Password</Form.Label>
        <Form.Input
          type="password"
          name="password"
          placeholder="Password"
          autocomplete="current-password"
          class="input input-bordered"
        />
        <Form.Validation />
      </Form.Field>

      <button class="btn btn-primary" use:loadingButton={form.submitting}>
        Log in
      </button>
      <span class="text-neutral-content">
        You may need to recreate your account since last time. Apologies for any
        inconvenience
      </span>
    </div>
  </Form.Root>

  <div class="divider">
    <span class="text-thin text-gray-400">Don't have an account?</span>
  </div>
  <div class="flex flex-col gap-2">
    <a
      href="/register"
      class="btn btn-ghost shadow w-full flex-row items-center"
    >
      <Icon icon="mdi:person" class="text-2xl" />
      <span>Register Here</span>
    </a>
    <button
      type="button"
      class="btn btn-ghost shadow flex-row flex-nowrap w-full"
      on:click={signInWithGoogle}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
        <path d="M1 1h22v22H1z" fill="none" />
      </svg>
      <span>Sign In With Google</span>
    </button>
  </div>
</div>
