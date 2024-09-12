<script lang="ts">
  import { goto } from '$app/navigation'
  import type {
    GameResponse,
    TeamResponse,
  } from '$lib/pocketbase/pocketbase-types'
  import { formatDate } from '$lib/util/functions/formatDate'
  import Icon from '@iconify/svelte'

  export let team: TeamResponse
  export let game: GameResponse
  export let href: string | undefined = undefined

  export let live: boolean = false
  export let scheduled: boolean = false
  export let finished: boolean = false

  $: success = finished && game.team_score > game.opponent_score
  $: error = finished && !success
  $: neutral = scheduled
</script>

<div
  class="!bg-opacity-30 card card-bordered border-2"
  class:bg-error={error}
  class:bg-success={success}
  on:click={() => href && goto(href)}
  class:cursor-pointer={href}
  class:hover:bg-info={href}
  role={href && 'link'}
>
  <div class="card-body">
    <h4 class="card-title flex justify-between w-full">
      <span>
        {team.name}({game.team_score}) vs {game.opponent}({game.opponent_score})
      </span>
      {#if live}
        <div class="flex gap-2">
          <span class="text-red-400">Live</span>
          <div
            class="mt-[10px] animate-pulse w-3 h-3 rounded-full bg-red-400"
          ></div>
        </div>
      {/if}
    </h4>
    <div class="text-gray-400 flex items-center gap-2">
      <Icon icon="formkit:date" />
      <span>{formatDate(game.start)}</span>
    </div>
  </div>
</div>
