<script lang="ts">
  import { GridApi, createGrid } from 'ag-grid-community'
  import 'ag-grid-community/styles/ag-grid.css'
  import 'ag-grid-community/styles/ag-theme-quartz.css'
  import { onMount } from 'svelte'
  import { toast } from './Toasts.svelte'
  import type { StatsRow } from '../../routes/[teamSlug]/statistics/data/data'

  let gridEl: HTMLDivElement

  export let teamSlug: string
  export let gameIds: string[] = []
  export let playerIds: string[] = []
  export let startDate: string = ''
  export let endDate: string = ''

  let grid: GridApi<StatsRow>
  onMount(() => {
    try {
      grid = createGrid(gridEl, {
        alwaysShowHorizontalScroll: true,
        suppressHorizontalScroll: false,
        autoSizeStrategy: {
          type: 'fitCellContents',
        },
        columnDefs: [
          { field: 'playerName', headerName: 'Player', pinned: true },
          { field: 'pointsPlayed', headerName: 'Points' },

          { field: 'goals', headerName: 'Goals' },
          { field: 'assists', headerName: 'Assists' },
          { field: 'blocks', headerName: 'Blocks' },
          { field: 'turns', headerName: 'Turns' },
          { field: 'drops', headerName: 'Drops' },

          {
            field: 'plusMinus',
            headerName: '(+/-)',
            headerTooltip: 'Plus Minus (G + A + B - T - D)',
          },
          {
            field: 'plusMinusPerPoint',
            headerName: '(+/-)/pt',
            headerTooltip: 'Plus Minus per Point',
            valueFormatter: (p) => p.data?.plusMinusPerPoint?.toFixed(2) ?? '',
          },
        ],
      })
    } catch (e) {
      if (e instanceof Error) {
        toast({
          type: 'error',
          message: e.message,
        })
      } else {
        toast({
            type: 'error',
            message: JSON.stringify(e)
        })
      }
      console.error(e)
    }
  })

  $: updateStats(teamSlug, gameIds, playerIds, startDate, endDate)
  async function updateStats(
    teamSlug: string,
    gameIds: string[],
    playerIds: string[],
    startDate: string,
    endDate: string,
  ) {
    if (typeof window === 'undefined' || !grid) return
    grid.setGridOption('rowData', null)
    if (!teamSlug) throw new Error('teamSlug cannot be empty')
    const resp = await fetch(
      `/${teamSlug}/statistics/data?gameIds=${gameIds.join(
        ',',
      )}&playerIds=${playerIds.join(
        ',',
      )}&startDate=${startDate}&endDate=${endDate}`,
    )
    const body = await resp.json()
    if (!resp.ok) {
      toast({ type: 'error', message: body.message })
      return
    }
    grid.setGridOption('rowData', body)
  }
</script>

<div class="max-w-screen w-screen overflow-x-scroll">
  <div
    id="stat-table"
    class="ag-theme-quartz h-[500px]"
    bind:this={gridEl}
  ></div>
</div>
