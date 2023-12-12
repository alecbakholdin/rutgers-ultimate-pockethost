<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { currentUser, pb } from '$lib/pocketbase/pb'
  import Icon from '@iconify/svelte'
</script>

<div class="navbar bg-base-200">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost">
      <img
        src="/machine-nightshade.png"
        class="h-[30px] transition-all"
        alt="machine-nightshade"
      />
      <span class="text-xl hidden sm:inline">Rutgers Ultimate</span></a
    >
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      {#if $currentUser}
        <li>
          <a href="/cart">
            <Icon icon="mdi:cart" class="text-base-content text-xl" />
          </a>
        </li>
        <li>
          <details class="relative">
            <summary> More </summary>
            <ul class="absolute right-0 z-[1] w-fit p-2 bg-base-100 rounded-t-none">
              <!-- {#if $currentUser.isManager}
                <li>
                  <a href="/orders/manager" class="whitespace-nowrap">
                    Manage Orders
                  </a>
                </li>
              {/if} -->
              <li>
                <a href="/orders"> Orders </a>
              </li>
              <li>
                <form
                  method="POST"
                  action="/logout"
                  use:enhance={() => {
                    return async ({ result }) => {
                      pb.authStore.clear()
                      await applyAction(result)
                    }
                  }}
                >
                  <button>Logout</button>
                </form>
              </li>
            </ul>
          </details>
        </li>
      {:else}
        <li><a href="/login">Log in</a></li>
        <li><a href="/register">Register</a></li>
      {/if}
    </ul>
  </div>
</div>
