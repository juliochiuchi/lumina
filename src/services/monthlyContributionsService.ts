import { getContributionSundays, type ContributionSunday } from "@/lib/opening-contributions"
import {
  isOfferContribution,
  isTitheContribution,
  OFFER_CONTRIBUTION_TYPE,
  TITHE_CONTRIBUTION_TYPE,
} from "@/lib/contributions"
import { membersService } from "@/services/membersService"
import { openingContributionsService, type OpeningContributionWithTotal } from "@/services/openingContributionsService"
import { supabase } from "@/utils/supabase"

type ContributionRow = {
  id: string
  id_member: string | null
  id_opening_contribution: string
  date_sunday: string
  amount: number | string | null
  type_contribution: string | null
}

export type MonthlyContributionOfferEntry = {
  id: string
  amount: number
}

export type MonthlyContributionMemberRow = {
  memberId: string
  memberName: string
  valuesBySunday: Record<string, number | null>
}

export type MonthlyContributionSheet = {
  openingContribution: OpeningContributionWithTotal
  sundays: ContributionSunday[]
  rows: MonthlyContributionMemberRow[]
  offersBySunday: Record<string, MonthlyContributionOfferEntry[]>
}

function toAmount(value: number | string | null | undefined) {
  return Math.round(Number(value ?? 0) * 100) / 100
}

function sumAmounts(values: Array<number | null | undefined>) {
  return Math.round(
    values.reduce<number>((sum, value) => sum + Number(value ?? 0), 0) * 100,
  ) / 100
}

function buildEmptyValuesBySunday(sundays: ContributionSunday[]) {
  return sundays.reduce<Record<string, number | null>>((accumulator, sunday) => {
    accumulator[sunday.date] = null
    return accumulator
  }, {})
}

async function getContributionRows(openingContributionId: string) {
  const { data, error } = await supabase
    .from("contributions")
    .select("id, id_member, id_opening_contribution, date_sunday, amount, type_contribution")
    .eq("id_opening_contribution", openingContributionId)

  if (error) {
    throw error
  }

  return (data ?? []) as ContributionRow[]
}

export const monthlyContributionsService = {
  async getSheet(openingContributionId: string): Promise<MonthlyContributionSheet> {
    const [openingContribution, members, contributionRows] = await Promise.all([
      openingContributionsService.getById(openingContributionId),
      membersService.getAll(),
      getContributionRows(openingContributionId),
    ])

    const sundays = getContributionSundays(openingContribution.year, openingContribution.month)

    const valuesByMember = new Map<string, Record<string, number | null>>(
      members.map((member) => [member.id, buildEmptyValuesBySunday(sundays)]),
    )

    const offersBySunday = sundays.reduce<Record<string, MonthlyContributionOfferEntry[]>>((accumulator, sunday) => {
      accumulator[sunday.date] = []
      return accumulator
    }, {})

    for (const row of contributionRows) {
      if (!row.date_sunday || !sundays.some((sunday) => sunday.date === row.date_sunday)) {
        continue
      }

      const amount = toAmount(row.amount)

      if (isOfferContribution(row.type_contribution)) {
        offersBySunday[row.date_sunday] = [
          ...(offersBySunday[row.date_sunday] ?? []),
          { id: row.id, amount },
        ]
        continue
      }

      if (!row.id_member || !isTitheContribution(row.type_contribution)) {
        continue
      }

      const currentMemberValues = valuesByMember.get(row.id_member)

      if (!currentMemberValues) {
        continue
      }

      currentMemberValues[row.date_sunday] = sumAmounts([
        currentMemberValues[row.date_sunday],
        amount,
      ])
    }

    const rows: MonthlyContributionMemberRow[] = members
      .map((member) => ({
        memberId: member.id,
        memberName: member.name,
        valuesBySunday: valuesByMember.get(member.id) ?? buildEmptyValuesBySunday(sundays),
      }))
      .sort((left, right) => left.memberName.localeCompare(right.memberName, "pt-BR"))

    return {
      openingContribution,
      sundays,
      rows,
      offersBySunday,
    }
  },

  async saveMemberContribution(params: {
    openingContributionId: string
    memberId: string
    dateSunday: string
    amount: number | null
  }) {
    const { openingContributionId, memberId, dateSunday, amount } = params

    const { data, error } = await supabase
      .from("contributions")
      .select("id, type_contribution")
      .eq("id_opening_contribution", openingContributionId)
      .eq("id_member", memberId)
      .eq("date_sunday", dateSunday)

    if (error) {
      throw error
    }

    const titheRows = ((data ?? []) as Pick<ContributionRow, "id" | "type_contribution">[])
      .filter((row) => isTitheContribution(row.type_contribution))

    if (amount === null) {
      if (titheRows.length > 0) {
        const { error: deleteError } = await supabase
          .from("contributions")
          .delete()
          .in("id", titheRows.map((row) => row.id))

        if (deleteError) {
          throw deleteError
        }
      }

      return
    }

    if (titheRows.length === 0) {
      const { error: insertError } = await supabase
        .from("contributions")
        .insert({
          id_member: memberId,
          id_opening_contribution: openingContributionId,
          date_sunday: dateSunday,
          amount,
          type_contribution: TITHE_CONTRIBUTION_TYPE,
        })

      if (insertError) {
        throw insertError
      }

      return
    }

    const [primaryRow, ...duplicateRows] = titheRows

    const { error: updateError } = await supabase
      .from("contributions")
      .update({
        amount,
        type_contribution: TITHE_CONTRIBUTION_TYPE,
      })
      .eq("id", primaryRow.id)

    if (updateError) {
      throw updateError
    }

    if (duplicateRows.length > 0) {
      const { error: deleteError } = await supabase
        .from("contributions")
        .delete()
        .in("id", duplicateRows.map((row) => row.id))

      if (deleteError) {
        throw deleteError
      }
    }
  },

  async createOffer(params: {
    openingContributionId: string
    dateSunday: string
    amount: number
  }) {
    const { data, error } = await supabase
      .from("contributions")
      .insert({
        id_member: null,
        id_opening_contribution: params.openingContributionId,
        date_sunday: params.dateSunday,
        amount: params.amount,
        type_contribution: OFFER_CONTRIBUTION_TYPE,
      })
      .select("id, amount")
      .single()

    if (error) {
      throw error
    }

    return {
      id: data.id as string,
      amount: toAmount(data.amount as number | string | null),
    } satisfies MonthlyContributionOfferEntry
  },

  async deleteOffer(offerId: string) {
    const { error } = await supabase
      .from("contributions")
      .delete()
      .eq("id", offerId)
      .eq("type_contribution", OFFER_CONTRIBUTION_TYPE)

    if (error) {
      throw error
    }
  },

  getMemberRowTotal(row: MonthlyContributionMemberRow) {
    return sumAmounts(Object.values(row.valuesBySunday))
  },

  getOfferSundayTotal(entries: MonthlyContributionOfferEntry[]) {
    return sumAmounts(entries.map((entry) => entry.amount))
  },
}
