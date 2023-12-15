<script context="module" lang="ts">
  import type { ActionResult, MaybePromise } from '@sveltejs/kit'
  import type { SvelteActionResult } from 'formsnap/dist/internal'
  import { writable } from 'svelte/store'

  export interface ToastData {
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timeoutMs?: number
  }
  const toasts = writable<ToastData[]>([])

  export function toast(toastData: Omit<ToastData, 'id'>) {
    const id = crypto.randomUUID()
    toasts.update((t) => [...t, { ...toastData, id }])
    setTimeout(
      () => toasts.update((arr) => arr.filter((arr) => arr.id !== id)),
      Math.max(0, toastData.timeoutMs || 1500),
    )
  }

  type SuperformOnResult = (event: {
    result: ActionResult
    formEl: HTMLFormElement
    cancel: () => void
  }) => MaybePromise<unknown | void>

  export function superformToast(): SuperformOnResult {
    function toastMsgObj(
      type: ToastData['type'],
      obj?: string | { message?: string },
    ) {
      const message =
        (typeof obj === 'string' ? obj : obj?.message) ??
        (type === 'success' ? undefined : 'Unexpected Error')

      if (message) {
        toast({
          message,
          type,
        })
      }
    }

    return ({ result }) => {
      console.log(result)
      switch (result.type) {
        case 'error':
          toastMsgObj('error', result.error)
          break
        case 'failure':
          toastMsgObj('error', (result as any)?.data?.form?.message)
          break
        case 'success':
          toastMsgObj('success', (result as any)?.data?.form?.message)
          break
      }
    }
  }
</script>

<div class="toast prose">
  {#each $toasts as toastData (toastData.id)}
    <div
      id={toastData.id}
      class="alert flex justify-center"
      class:alert-success={toastData.type === 'success'}
      class:alert-info={toastData.type === 'info'}
      class:alert-error={toastData.type === 'error'}
      class:alert-warning={toastData.type === 'warning'}
    >
      <span>{toastData.message}</span>
    </div>
  {/each}
</div>
