<script lang="ts">
    import { page } from '$app/stores'
    import { writable } from "svelte/store"
    import type { StatsRow } from "../../routes/[teamSlug]/statistics/data/data"

    let gridEl: HTMLDivElement

    export let gameIds: string[] = []
    export let playerIds: string[] = []
    export let startDate: string = ''
    export let endDate: string = ''

   const stats = writable<StatsRow[]>([])
   async function updateStats(gameIds: string[], playerIds: string[], startDate: string, endDate: string) {
    const teamSlug = $page.params.teamSlug
    if(!teamSlug) throw new Error("teamSlug cannot be empty")
    const resp = await fetch(`/${teamSlug}/statistics/data?gameIds=${gameIds.join(',')}&playerIds=${playerIds.join(',')}&startDate=${startDate}&endDate=${endDate}`)
   }
</script>

<div bind:this={gridEl}></div>