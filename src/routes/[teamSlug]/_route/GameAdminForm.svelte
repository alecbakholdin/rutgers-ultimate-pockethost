<script lang="ts">
  import { enhance } from '$app/forms'
  import { toast } from '$lib/component/Toasts.svelte'
  import type { TeamResponse } from '$lib/pocketbase/pocketbase-types'

  export let team: TeamResponse
</script>

<div class="card">
  <form
    method="POST"
    action="?/createGame"
    use:enhance={() => {
      return async ({ result, update }) => {
        result.type === 'error' &&
          toast({ type: 'error', message: result.error?.message })
        result.type === 'failure' &&
          toast({ type: 'error', message: 'Unexpected failure' })
        if (result.type !== 'error' && result.type !== 'failure') await update()
      }
    }}
    class="card-body"
  >
    <div class="card-title">
      <h3>New Game</h3>
    </div>
    <div class="flex flex-col gap-1">
      <input type="hidden" name="team" value={team.id} />
      <label for="opponent" class="label">Opponent</label>
      <input
        type="text"
        name="opponent"
        id="opponent"
        class="input input-bordered"
        placeholder="Opponent"
      />
      <label for="start_date" class="label">Start</label>
      <div class="flex gap-1 [&>*]:flex-grow">
        <input
          class="input input-bordered"
          type="date"
          name="start_date"
          id="start_date"
          aria-label="start date"
        />
        <input
          class="input input-bordered"
          type="time"
          name="start_time"
          id="start_time"
          aria-label="start time"
        />
      </div>
    </div>
    <div class="card-actions">
      <button class="btn">+ Create Game</button>
    </div>
  </form>
</div>
