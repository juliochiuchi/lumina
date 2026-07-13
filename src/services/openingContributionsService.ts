import {
  compareContributionMonths,
  normalizeOpeningContributionMonth,
  normalizeOpeningContributionYear,
} from "@/lib/opening-contributions"
import { supabase } from "@/utils/supabase"

export type OpeningContribution = {
  id: string
  year: string
  month: string
}

export type OpeningContributionWithTotal = OpeningContribution & {
  total_amount: number
}

type OpeningContributionPayload = {
  year: string
  month: string
}

export type Contribution = {
  id: string
  id_member: string
  id_opening_contribution: string
  date_sunday: string
  amount: number | string | null
  type_contribution: string
}

async function getMonthlyTotal(openingContributionId: string) {
  const { data, error } = await supabase
    .from("contributions")
    .select("amount")
    .eq("id_opening_contribution", openingContributionId)

  if (error) {
    throw error
  }

  return ((data ?? []) as Pick<Contribution, "amount">[]).reduce(
    (sum, contribution) => sum + Number(contribution.amount ?? 0),
    0,
  )
}

async function assertNoDuplicateOpeningContribution(
  payload: OpeningContributionPayload,
  currentId?: string,
) {
  const normalizedYear = normalizeOpeningContributionYear(payload.year)
  const normalizedMonth = normalizeOpeningContributionMonth(payload.month)

  let query = supabase
    .from("opening_contributions")
    .select("id")
    .eq("year", normalizedYear)
    .eq("month", normalizedMonth)
    .limit(1)

  if (currentId) {
    query = query.neq("id", currentId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  if ((data ?? []).length > 0) {
    throw new Error("Já existe uma abertura cadastrada para este ano e mês")
  }
}

export const openingContributionsService = {
  async getAvailableYears() {
    const { data, error } = await supabase
      .from("opening_contributions")
      .select("year")
      .order("year", { ascending: false })

    if (error) {
      throw error
    }

    return Array.from(
      new Set((data ?? []).map((item) => normalizeOpeningContributionYear(item.year)).filter(Boolean)),
    )
  },

  async getByYear(year: string) {
    const { data, error } = await supabase
      .from("opening_contributions")
      .select("id, year, month")
      .eq("year", year)

    if (error) {
      throw error
    }

    const openings = (data ?? []) as OpeningContribution[]

    const openingsWithTotal = await Promise.all(
      openings.map(async (opening) => ({
        ...opening,
        year: normalizeOpeningContributionYear(opening.year),
        month: normalizeOpeningContributionMonth(opening.month),
        total_amount: await getMonthlyTotal(opening.id),
      })),
    )

    return openingsWithTotal.sort((left, right) => compareContributionMonths(left.month, right.month))
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("opening_contributions")
      .select("id, year, month")
      .eq("id", id)
      .single()

    if (error) {
      throw error
    }

    const opening = data as OpeningContribution

    return {
      ...opening,
      year: normalizeOpeningContributionYear(opening.year),
      month: normalizeOpeningContributionMonth(opening.month),
      total_amount: await getMonthlyTotal(opening.id),
    } satisfies OpeningContributionWithTotal
  },

  async create(payload: OpeningContributionPayload) {
    const normalizedYear = normalizeOpeningContributionYear(payload.year)
    const normalizedMonth = normalizeOpeningContributionMonth(payload.month)
    await assertNoDuplicateOpeningContribution(payload)

    const { data, error } = await supabase
      .from("opening_contributions")
      .insert({
        year: normalizedYear,
        month: normalizedMonth,
      })
      .select("id, year, month")
      .single()

    if (error) {
      throw error
    }

    return data as OpeningContribution
  },

  async update(id: string, payload: OpeningContributionPayload) {
    const normalizedYear = normalizeOpeningContributionYear(payload.year)
    const normalizedMonth = normalizeOpeningContributionMonth(payload.month)
    await assertNoDuplicateOpeningContribution(payload, id)

    const { data, error } = await supabase
      .from("opening_contributions")
      .update({
        year: normalizedYear,
        month: normalizedMonth,
      })
      .eq("id", id)
      .select("id, year, month")
      .single()

    if (error) {
      throw error
    }

    return data as OpeningContribution
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("opening_contributions")
      .delete()
      .eq("id", id)

    if (error) {
      throw error
    }
  },
}
