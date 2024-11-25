import { error } from "@sveltejs/kit";
import { type Writable, writable } from "svelte/store";

export function localStorageStore<T>(key: string, initialValue: T): Writable<T> {
    if (typeof window == 'undefined') {
        return writable(initialValue)
    }

    const localStorageVal = localStorage.getItem(key)
    const initialVal = localStorageVal ? (JSON.parse(localStorageVal) as T) : initialValue
    const data = writable(initialVal)
    data.subscribe(d => {
        localStorage.setItem(key, JSON.stringify(d))
    })

    return data
}