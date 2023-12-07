<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { pb } from '$lib/pocketbase/pb'
  import { loadingButton } from '$lib/util/svelte-actions/loading-button'
  import { writable } from 'svelte/store'
  const loading = writable(false)
</script>

<form
  method="POST"
  class="card max-w-xl mx-auto"
  use:enhance={() => {
    $loading = true
    return async ({ result }) => {
      $loading = false
      pb.authStore.loadFromCookie(document.cookie)
      await applyAction(result)
    }
  }}
>
  <h1 class="text-2xl mb-8">Register</h1>
  <div class="form-control gap-2 mb-4">
    <input
      type="name"
      name="name"
      placeholder="First Name"
      autocomplete="given-name"
      class="input input-bordered"
    />
    <input
      type="email"
      name="email"
      placeholder="Email"
      autocomplete="email"
      class="input input-bordered"
    />
    <input
      type="password"
      name="password"
      placeholder="Password"
      autocomplete="new-password"
      class="input input-bordered"
    />
    <input
      type="password"
      name="passwordConfirm"
      placeholder="Confirm password"
      autocomplete="new-password"
      class="input input-bordered"
    />
    <button class="btn btn-primary" use:loadingButton={loading}>
      Register
    </button>
  </div>
</form>
