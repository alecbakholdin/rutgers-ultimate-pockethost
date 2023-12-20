<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { cartItemCount } from '$lib/pocketbase/cart'
  import { currentUser, pb } from '$lib/pocketbase/pb'
  import Icon from '@iconify/svelte'

  let open = false
  let summaryEl: HTMLElement
</script>

<svelte:window on:click={(e) => e.target !== summaryEl && (open = false)} />

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
          <details class="relative" bind:open>
            <summary bind:this={summaryEl}> More </summary>
            <ul
              class="absolute right-0 z-[1] w-fit p-2 bg-base-100 rounded-t-none"
            >
              {#if $currentUser.isManager}
                <li>
                  <a href="/manage" class="whitespace-nowrap"> Admin </a>
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
            </ul>
          </details>
        </li>
      {:else}
        <li><a href="/login">Log in</a></li>
      {/if}
    </ul>
  </div>
</div>
