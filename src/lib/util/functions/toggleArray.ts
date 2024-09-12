export function toggleArray<T extends string | number>(
  arr: T[] | undefined | null,
  val: T,
): T[] {
  return arr?.includes(val)
    ? arr?.filter((x) => x !== val) || []
    : [...(arr || []), val]
}
