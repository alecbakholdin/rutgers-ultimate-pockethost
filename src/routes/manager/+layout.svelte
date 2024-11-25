<script context="module">
  export const adminPages = [
    { path: '/storeOrders', title: 'Campaigns' },
    { path: '/orders', title: 'Order Fulfillment' },
    /*{ path: '/products', title: 'Products' }, */
  ]
</script>

<script lang="ts">
  import { page } from '$app/stores'
  import Icon from '@iconify/svelte'
</script>

<div class="drawer">
  <input type="checkbox" id="admin-drawer" class="drawer-toggle"/>
  <div class="drawer-content flex flex-col md:flex-row gap-2">
    {#if adminPages.length > 1}
      <label for="admin-drawer" class="btn btn-circle btn-ghost btn-sm">
        <Icon icon="mdi:menu" class="text-xl"></Icon>
      </label>
    {/if}
    <div>
      <slot />
    </div>
  </div>
  <div class="drawer-side z-10">
    <label for="admin-drawer" class="drawer-overlay" aria-label="close sidebar">
    </label>
    <ul class="menu p-8 w-80 min-h-full bg-base-200 text-base-content">
      {#each adminPages as { title, path }}
        <li>
          <a
            href="/manager{path}"
            class:active={$page.route.id === `/manager${path}`}
          >
            {title}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>
