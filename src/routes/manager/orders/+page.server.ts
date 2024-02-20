import { error } from '@sveltejs/kit'

export const actions = {
  async markCompleted({ request, locals: {pb} }) {
    const form = await request.formData()
    const id = form.get('id')?.toString()
    const fulfilled = form.get('fulfilled')?.toString() === 'on'
    
    if (!id) {
        throw error(400, 'Missing id');
    }
    await pb.collection('order_line_item').update(id, {fulfilled})
  },
}
