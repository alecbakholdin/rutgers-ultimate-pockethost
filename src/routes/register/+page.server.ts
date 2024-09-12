import { redirect } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/client'
import type { Actions } from './$types'
import { RegisterAccountSchema } from './schemas'
import { ClientResponseError } from 'pocketbase'

export async function load() {
  return {
    registerForm: await superValidate(RegisterAccountSchema),
  }
}

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const form = await superValidate(request, RegisterAccountSchema)

    try {
      await locals.pb
        .collection('users')
        .create({ ...form.data, emailVisibility: true })
    } catch (e) {
      console.error(JSON.stringify(e, null, 2))
      if (e instanceof ClientResponseError) {
        for (const [key, val] of Object.entries(e.response.data)) {
          try {
            ;(form.errors as any)[key] = [
              ...((form.errors as any)[key] ?? []),
              (val as any)?.message,
            ]
          } catch (e) {
            console.error(e)
          }
        }
      }
      return message(form, 'Failed to register', { status: 400 })
    }
    try {
      await locals.pb
        .collection('users')
        .authWithPassword(form.data.email, form.data.password)
    } catch (e) {
      console.error(JSON.stringify(e, null, 2))
      return message(
        form,
        'Registration succeeded, but login failed. Try going to login page and logging in again',
        { status: 500 },
      )
    }

    throw redirect(303, '/')
  },
}
