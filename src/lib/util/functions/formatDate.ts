const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export function formatDate(date: Date | string | undefined | null) {
  if (!date) return ''
  date = typeof date === 'string' ? new Date(date) : date
  const month = months[date.getMonth()]
  const day = date.getDate()
  const hour = date.getHours() === 12 ? 12 : (date.getHours() % 12)
  const minute = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM'
  return `${month} ${day} @ ${hour}:${minute} ${ampm}`
}
