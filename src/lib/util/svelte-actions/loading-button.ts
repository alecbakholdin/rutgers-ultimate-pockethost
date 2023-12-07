import type { ActionReturn } from 'svelte/action'
import type { Readable } from 'svelte/store'

export function loadingButton(
  node: HTMLButtonElement,
  loading: Readable<boolean>,
): ActionReturn {
  let innerHTML = node.innerHTML
  let width = node.clientWidth
  let height = node.clientHeight
  let disabledStatus = node.disabled

  loading.subscribe(($loading) => {
    if ($loading) {
      innerHTML = node.innerHTML
      width = node.clientWidth
      height = node.clientHeight
      disabledStatus = node.disabled
    }
    node.innerHTML = $loading
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" opacity=".5"/><path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"><animateTransform attributeName="transform" dur="1s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate"/></path></svg>'
      : innerHTML
    node.style.width = $loading ? `${width}px` : ''
    node.style.height = $loading ? `${height}px` : ''
    node.disabled = $loading ? true : disabledStatus
  })
  return {}
}
