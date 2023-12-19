import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { message, superValidate } from 'sveltekit-superforms/client'
import { LoginWithPasswordSchema } from './schemas'

export async function load() {
  return {
    loginForm: await superValidate(LoginWithPasswordSchema)
  }
}

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const form = await superValidate(request, LoginWithPasswordSchema);
    if (!form) return fail(400, { form });
    const { email, password } = form.data;

    try {
      await locals.pb
        .collection('users')
        .authWithPassword(email, password)
    } catch (e) {
      console.error(e)
      return message(form, "Invalid login credentials", { status: 400 })
    }

    throw redirect(303, '/')
  },
}
