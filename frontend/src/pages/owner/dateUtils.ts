export function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

export function todayIsoLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function firstDayOfMonthIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`
}
