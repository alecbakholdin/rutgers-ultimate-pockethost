import { error } from '@sveltejs/kit'

export const actions = {
  async markReceived({ request, locals: { pb } }) {
    const form = await request.formData()
    const id = form.get('id')?.toString()
    const received = form.get('received')?.toString() === 'on'

    if (!id) {
      throw error(400, 'Missing id')
    }
    await pb.collection('order_line_item').update(id, { received })
  },
  async markFulfilled({ request, locals: { pb } }) {
    const form = await request.formData()
    const id = form.get('id')?.toString()
    const fulfilled = form.get('fulfilled')?.toString() === 'on'

    if (!id) {
      throw error(400, 'Missing id')
    }
    await pb.collection('order_line_item').update(id, { fulfilled })
  },
}
