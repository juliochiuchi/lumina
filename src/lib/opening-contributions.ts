export const OPENING_CONTRIBUTION_MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const

export type OpeningContributionMonth = (typeof OPENING_CONTRIBUTION_MONTHS)[number]

function normalizeMonthKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

const monthIndexByName = new Map<string, number>(
  OPENING_CONTRIBUTION_MONTHS.map((month, index) => [month, index]),
)

const canonicalMonthByKey = new Map<string, OpeningContributionMonth>(
  OPENING_CONTRIBUTION_MONTHS.map((month) => [normalizeMonthKey(month), month]),
)

export function normalizeOpeningContributionMonth(month: string) {
  return canonicalMonthByKey.get(normalizeMonthKey(month)) ?? month.trim()
}

export function normalizeOpeningContributionYear(year: string) {
  return year.trim()
}

export function getMonthIndex(month: string) {
  return monthIndexByName.get(normalizeOpeningContributionMonth(month)) ?? -1
}

export function compareContributionMonths(leftMonth: string, rightMonth: string) {
  return getMonthIndex(leftMonth) - getMonthIndex(rightMonth)
}
