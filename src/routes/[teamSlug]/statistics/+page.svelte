<script lang="ts">
  import StatTable from '$lib/component/StatTable.svelte'
  import { page } from '$app/stores'
  export let data

  $: startDate = $page.url.searchParams.get('startDate') ?? '';
  $: endDate = $page.url.searchParams.get('endDate') ?? '';

</script>

<form
  method="get"
  class="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto_1fr] max-w-[200px] sm:max-w-[400px] py-2 gap-2 items-center text-gray-400"
>
  <span>From</span>
  <input
    placeholder=""
    class="input input-bordered"
    type="date"
    name="startDate"
    value={startDate}
  />
  <span>To</span>
  <input
    class="input input-bordered"
    type="date"
    name="endDate"
    value={endDate}
  />
  <div class="col-span-full">
    <button class="btn">Submit</button>
  </div>
</form>

<div class="h-screen overflow-x-scroll">
  <StatTable teamSlug={data.team.slug} {startDate} {endDate}/>
</div>
