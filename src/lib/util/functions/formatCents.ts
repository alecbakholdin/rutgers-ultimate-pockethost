export function formatCents(num: number, options?: {excludeDollar?: boolean}) {
  return `${options?.excludeDollar ? '' : '$'}${(num / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
