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

export function getContributionMonthNumber(month: string) {
  const monthIndex = getMonthIndex(month)

  if (monthIndex < 0) {
    throw new Error("Mês de contribuição inválido")
  }

  return monthIndex
}

export type ContributionSunday = {
  date: string
  label: string
  dayNumber: number
}

export function getContributionSundays(year: string, month: string): ContributionSunday[] {
  const monthNumber = getContributionMonthNumber(month)
  const parsedYear = Number(year)

  if (!Number.isInteger(parsedYear)) {
    throw new Error("Ano de contribuição inválido")
  }

  const sundays: ContributionSunday[] = []
  const cursor = new Date(parsedYear, monthNumber, 1)

  while (cursor.getMonth() === monthNumber) {
    if (cursor.getDay() === 0) {
      const isoDate = new Date(
        Date.UTC(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()),
      ).toISOString().slice(0, 10)

      sundays.push({
        date: isoDate,
        label: `DOM ${String(cursor.getDate()).padStart(2, "0")}`,
        dayNumber: cursor.getDate(),
      })
    }

    cursor.setDate(cursor.getDate() + 1)
  }

  return sundays
}
