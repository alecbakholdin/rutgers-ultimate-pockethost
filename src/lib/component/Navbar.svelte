<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { currentUser, pb } from '$lib/pocketbase/pb'
  import Icon from '@iconify/svelte'
</script>

<div class="bg-base-200">
  <div class="max-w-5xl mx-auto navbar">
    <a href="/" class="navbar-start btn btn-ghost">
      <!-- <img src="/machine.png" width={50} height={50} alt="machine"/>
      <img src="/nightshade.png" width={50} height={50} alt="nightshade"/> -->
      <img src="/machine-nightshade.png" class="h-[25px] -rotate-90" alt="machine-nightshade"/>
      <span class="text-xl invisible sm:visible">Rutgers Ultimate</span>
    </a>
    <div class="navbar-end">
      <ul class="menu menu-horizontal">
        {#if $currentUser}
          <li>
            <a href="/cart">
              <Icon icon="mdi:cart" class="text-base-content text-xl" />
            </a>
          </li>
          <li>
            <a href="/orders">
              My Orders
            </a>
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
              <button>Log out</button>
            </form>
          </li>
        {:else}
          <li><a href="/login">Log in</a></li>
          <li><a href="/register">Register</a></li>
        {/if}
      </ul>
    </div>
  </div>
</div>
