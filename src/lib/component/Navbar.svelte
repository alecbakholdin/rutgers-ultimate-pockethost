<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { cartItemCount } from '$lib/pocketbase/cart'
  import { currentUser, pb } from '$lib/pocketbase/pb'
  import Icon from '@iconify/svelte'
  import Dropdown from './Dropdown.svelte'
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
          <a href="/cart" class="relative">
            <Icon icon="mdi:cart" class="text-base-content text-xl" />
            {#if $cartItemCount}
              <div
                class="absolute h-5 w-5 rounded-full grid place-items-center bottom-[2px] right-[4px] p-[0.5px] bg-base-200"
              >
                <span
                  class="bg-neutral w-full h-full grid place-items-center rounded-full text-neutral-content text-xs"
                >
                  <span class="text-center"> {$cartItemCount}</span>
                </span>
              </div>
            {/if}
          </a>
        </li>
        <li>
          <Dropdown>
            <svelte:fragment slot="trigger">More</svelte:fragment>

            {#if $currentUser.isManager}
              <li>
                <a href="/manager" class="whitespace-nowrap"> Admin </a>
              </li>
            {/if}
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
          </Dropdown>
        </li>
      {:else}
        <li><a href="/login">Log in</a></li>
      {/if}
    </ul>
  </div>
</div>
