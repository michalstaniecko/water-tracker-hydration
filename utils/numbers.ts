export function roundToTen(num: number) {
  return Math.round(num / 10) * 10;
}

export function roundBy(num: number, by: number) {
  const rounded = Math.round(num);
  const rest = rounded % by;
  return rest >= by / 2 ? rounded + (by - rest) : rounded - rest;
}
