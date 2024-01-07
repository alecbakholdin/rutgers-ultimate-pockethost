<script lang="ts">
  import { page } from '$app/stores'
  import Icon from '@iconify/svelte'
</script>

<div class="drawer z-[10]">
  <input type="checkbox" id="admin-drawer" class="drawer-toggle" />
  <div class="drawer-content flex flex-col md:flex-row gap-2">
    <label for="admin-drawer" class="btn btn-circle btn-ghost btn-sm">
      <Icon icon="mdi:menu" class="text-xl"></Icon>
    </label>
    <div>
      <slot />
    </div>
  </div>
  <div class="drawer-side">
    <label for="admin-drawer" class="drawer-overlay" aria-label="close sidebar">
    </label>
    <ul class="menu p-8 w-80 min-h-full bg-base-200 text-base-content">
      <li>
        <a
          href="/manager/merchOrders"
          class:active={$page.route.id === '/manager/merchOrders'}
          >Jersey Orders</a
        >
      </li>
      <li>
        <a
          href="/manager/orders"
          class:active={$page.route.id === '/manager/orders'}>Orders</a
        >
      </li>
      <li>
        <a
          href="/manager/products"
          class:active={$page.route.id === '/manager/products'}>Products</a
        >
      </li>
    </ul>
  </div>
</div>
