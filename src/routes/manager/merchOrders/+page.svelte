<script lang="ts">
  export let data
</script>

<div class="mx-auto">
  <h2 class="text-lg font-semibold">Order Manager</h2>
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>White</th>
          <th>Dark</th>
          <th>Dark Shorts</th>
        </tr>
      </thead>
      <tbody>
        {#each data.completedOrders as order}
          <tr>
            <td>{order.name}</td>
            <td>{order.email}</td>
            <td>{order.white}</td>
            <td>{order.dark}</td>
            <td>{order.dark_shorts}</td>
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <div class="join"></div>
      </tfoot>
    </table>
  </div>
</div>
