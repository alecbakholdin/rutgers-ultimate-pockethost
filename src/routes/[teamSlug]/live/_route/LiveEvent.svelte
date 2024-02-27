<script lang="ts">
  import { fly } from 'svelte/transition'

  export let type: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  /* export let time: Date | undefined = undefined; */

  const id = crypto.randomUUID()
</script>

<div
  class="card card-compact bg-opacity-30"
  class:bg-success={type === 'success'}
  class:text-success-content={type === 'success'}
  class:bg-warning={type === 'warning'}
  class:text-warning-content={type === 'warning'}
  class:bg-error={type === 'error'}
  class:text-error-content={type === 'error'}
  class:bg-info={type === 'info'}
  class:text-info-content={type === 'info'}
  class:bg-neutral-content={type === 'neutral'}
  class:text-neutral={type === 'neutral'}
  transition:fly
>
  <div class="card-body">
    <div class="card-title !mb-0 flex w-full">
      <slot
      /><!-- <span class="flex-grow text-right text-xs opacity-40">3m ago</span> -->
    </div>
    <slot name="body" />
  </div>
</div>
