<script lang="ts">
  import {
    GamePointEventTypeOptions,
    GamePointTypeOptions,
    type GameRecord,
    type GameResponse,
    type TeamResponse,
  } from '$lib/pocketbase/pocketbase-types'
  import _ from 'lodash'
  import type { LiveFeedGamePoint } from './gamePointType'
  import { formatDate } from '$lib/util/functions/formatDate'
  import { pb } from '$lib/pocketbase/pb'
  import Icon from '@iconify/svelte'
  import dateFormat from 'dateformat'

  export let game: GameResponse
  export let team: TeamResponse
  export let gamePoints: LiveFeedGamePoint[] | undefined = undefined

  export let size: 'sm' | 'lg' = 'lg'

  $: isLive = team?.live_game === game?.id && !game?.end
  $: isFinal = Boolean(game?.end)

  $: teamLogo = team.logo ? pb.getFileUrl(team, team.logo) : '/smiley.png'
  $: opponentLogo = '/opponent.png'

  $: gamePointEvents =
    gamePoints?.flatMap((x) => x.expand?.['game_point_event(game_point)']) ?? []
  $: opponentBreaks =
    gamePoints?.filter(
      (x) => x.type === GamePointTypeOptions.O && x.opponent_goal,
    ).length ?? 0
  $: teamBreaks =
    gamePoints?.filter((x) => x.type === GamePointTypeOptions.D && x.goal)
      .length ?? 0
  $: breakOpportunities = (opponent: boolean) =>
    gamePoints
      ?.filter(
        (p) =>
          (opponent && p.type === GamePointTypeOptions.O) ||
          (!opponent && p.type === GamePointTypeOptions.D),
      )
      .filter((p) =>
        p.expand?.['game_point_event(game_point)']?.find(
          (e) =>
            e.type === GamePointEventTypeOptions.Turn ||
            e.type == GamePointEventTypeOptions.Block ||
            e.type === GamePointEventTypeOptions.Drop,
        ),
      ).length

  $: turns = (opponent?: boolean) =>
    gamePointEvents.filter(
      (x) =>
        x &&
        (([
          GamePointEventTypeOptions.Turn,
          GamePointEventTypeOptions.Drop,
        ].includes(x.type) &&
          !!opponent === !!x.opponent) ||
          (x.type === GamePointEventTypeOptions.Block &&
            !!opponent === !x.opponent)),
    )
  function formatCap(game: GameRecord, capMin: number) {
    const newDate = new Date(game.start!).getTime() + 60 * capMin * 1000
    return dateFormat(newDate, 'hh:MM TT')
  }
</script>

<div class="max-w-sm w-full">
  <div class="card rounded-md card-compact card-bordered w-full">
    <div class="card-body !p-0">
      <div class="p-2 border-b w-full grid grid-cols-[1fr_3fr_1fr]">
        <div
          class="w-fit rounded bg-opacity-30 flex items-center gap-1 text-xs py-1 px-2"
          class:bg-red-400={isLive}
          class:text-red-400={isLive}
          class:bg-gray-400={!isLive}
          class:text-neutral={!isLive}
        >
          {#if isLive}
            <div
              class="rounded-full mb-[1px] w-2 h-2 bg-red-400 mt-[2px] animate-pulse"
            ></div>
          {/if}
          <span>{isLive ? 'Live' : isFinal ? 'Final' : 'Scheduled'}</span>
        </div>
        <span class="text-gray-500 text-center">
          {game?.start && formatDate(game.start)}
        </span>
        {#if size !== 'sm'}
          <a
            data-sveltekit-preload-data="off"
            href="/machine/statistics?game={game?.id}"
            class="text-right text-gray-500"
          >
            Stats
          </a>
        {/if}
      </div>
    </div>
    <div class="p-2 grid grid-cols-[1fr_auto_1fr] place-items-center">
      <div class="flex flex-col items-center">
        <img
          class="object-contain w-20 h-20"
          class:hidden={size === 'sm'}
          src={teamLogo}
          alt={team.name}
        />
        <span class="text-center font-semibold">{team.name}</span>
      </div>
      <div class="flex flex-col items-center">
        <div class="grid gap-2 grid-cols-[1fr_auto_1fr] font-bold py-4">
          <span class="text-4xl text-success text-right"
            >{game?.team_score}</span
          >
          <span class="text-2xl text-gray-400 mt-1 text-center">:</span>
          <span class="text-4xl text-error text-left"
            >{game?.opponent_score}</span
          >
        </div>
        {#if gamePoints}
          <div class="grid gap-x-2 grid-cols-[1fr_auto_1fr]">
            <span class="text-success text-right">{teamBreaks}</span>
            <span class="text-gray-400 text-center">Breaks</span>
            <span class="text-error text-left">{opponentBreaks}</span>
            <span class="text-success text-right"
              >{breakOpportunities(false)}</span
            >
            <span class="text-gray-400 text-center">Break Opps</span>
            <span class="text-error text-left">{breakOpportunities(true)}</span>
            <span class="text-success text-right">{turns(false).length}</span>
            <span class="text-gray-400 text-center">Turns</span>
            <span class="text-error text-left">{turns(true).length}</span>
          </div>
        {/if}
      </div>
      <div class="flex flex-col items-center">
        <img
          class="object-contain w-20 h-20"
          class:hidden={size === 'sm'}
          src={opponentLogo}
          alt={game?.opponent}
        />
        <span class="text-center font-semibold">{game?.opponent}</span>
      </div>
    </div>
  </div>
  {#if size !== 'sm'}
    <div class="mx-auto flex justify-between w-full mt-2">
      {#if game.half_cap_min}
        <div class="flex items-center gap-1">
          <Icon icon="fluent:hourglass-half-20-regular" />
          <span class="text-neutral text-sm"
            >{formatCap(game, game.half_cap_min)}</span
          >
        </div>
      {/if}
      {#if game.soft_cap_min}
        <div class="flex items-center gap-1">
          <Icon icon="fluent:hourglass-three-quarter-16-regular" />
          <span class="text-neutral text-sm"
            >{formatCap(game, game.soft_cap_min)}</span
          >
        </div>
      {/if}
      {#if game.hard_cap_min}
        <div class="flex items-center gap-1">
          <Icon icon="material-symbols:done" />
          <span class="text-neutral text-sm"
            >{formatCap(game, game.hard_cap_min)}</span
          >
        </div>
      {/if}
    </div>
  {/if}
</div>
