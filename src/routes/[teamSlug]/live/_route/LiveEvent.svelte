<script context="module" lang="ts">
  const now = writable(new Date().getTime())
  function updateTime() {
    now.set(new Date().getTime())
    setTimeout(updateTime, 1000)
  }
  updateTime()
</script>

<script lang="ts">
  import _ from 'lodash'
  import { writable } from 'svelte/store'
  import { fly } from 'svelte/transition'

  export let type: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  export let time: Date | string | undefined = undefined

  $: timeAsDate =
    time !== undefined && typeof time === 'string' ? new Date(time) : time
  $: timeNum = timeAsDate?.getTime()
  $: timeDiffNum = timeNum && $now - timeNum
  $: timeDiffStr = timeDiffNum && getTimeDiffString(timeDiffNum)

  const id = crypto.randomUUID()

  function getTimeDiffString(diff: number) {
    const second = 1000
    const minute = 60 * second
    const hour = 60 * minute
    const day = 24 * hour
    const month = 28 * day
    if (diff < minute) {
      return `${Math.floor(diff / second)}s ago`
    }
    if (diff < hour) {
      return `${Math.floor(diff / minute)}m ago`
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}h${Math.floor(
        (diff % hour) / minute,
      )}m ago`
    } else if (diff < month) {
      return `${Math.floor(diff / day)}d ago`
    }
    return 'A while ago'
  }
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
      <slot />
      {#if timeDiffStr}
        <span class="flex-grow text-right text-xs opacity-40">
          {timeDiffStr}
        </span>
      {/if}
    </div>
    <slot name="body" />
  </div>
</div>
