import parseColor from 'parse-css-color'

export function getContrastColor(colorString: string): '#ffffff' | '#000000' {
  const res = parseColor(colorString)
  if (!res) return '#ffffff'
  const [red, green, blue] = res.values
  if (red * 0.299 + green * 0.587 + blue * 0.114 > 186) {
    return '#000000'
  }
  return '#ffffff'
}
