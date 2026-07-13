import { useEffect, useState } from "react"

import {
  formatContributionCurrency,
  formatContributionValue,
  parseContributionInput,
  sanitizeContributionInput,
} from "@/lib/contributions"
import type { ContributionSunday } from "@/lib/opening-contributions"
import { cn } from "@/lib/utils"
import type {
  MonthlyContributionMemberRow,
  MonthlyContributionOfferEntry,
} from "@/services/monthlyContributionsService"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type PreviewMap = Record<string, number | null>

type ContributionsEditableTableProps = {
  canEditMemberValues?: boolean
  rows: MonthlyContributionMemberRow[]
  sundays: ContributionSunday[]
  offersBySunday: Record<string, MonthlyContributionOfferEntry[]>
  previewValues: PreviewMap
  savingCellKeys: Set<string>
  emptyMemberMessage?: string
  onPreviewChange: (cellKey: string, value?: number | null) => void
  onCommitMemberValue: (memberId: string, dateSunday: string, amount: number | null) => Promise<boolean>
  onOpenOfferDetails: (dateSunday: string) => void
}

type EditableContributionCellProps = {
  canEdit: boolean
  cellKey: string
  value: number | null
  isSaving: boolean
  onPreviewChange: (cellKey: string, value?: number | null) => void
  onCommit: (amount: number | null) => Promise<boolean>
}

function hasPreviewValue(previewValues: PreviewMap, cellKey: string) {
  return Object.prototype.hasOwnProperty.call(previewValues, cellKey)
}

function getDisplayMemberValue(
  previewValues: PreviewMap,
  cellKey: string,
  persistedValue: number | null,
) {
  return hasPreviewValue(previewValues, cellKey) ? previewValues[cellKey] : persistedValue
}

function sumValues(values: Array<number | null | undefined>) {
  return Math.round(
    values.reduce<number>((sum, value) => sum + Number(value ?? 0), 0) * 100,
  ) / 100
}

function getNumericCellClassName() {
  return "w-full min-w-24 text-right tabular-nums"
}

function EditableContributionCell({
  canEdit,
  cellKey,
  value,
  isSaving,
  onPreviewChange,
  onCommit,
}: EditableContributionCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftValue, setDraftValue] = useState("")

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value === null ? "" : formatContributionValue(value))
    }
  }, [isEditing, value])

  const handleCancel = () => {
    setIsEditing(false)
    setDraftValue(value === null ? "" : formatContributionValue(value))
    onPreviewChange(cellKey, undefined)
  }

  const handleCommit = async () => {
    const parsedAmount = parseContributionInput(draftValue)
    const success = await onCommit(parsedAmount)

    if (success) {
      setIsEditing(false)
      onPreviewChange(cellKey, undefined)
    }
  }

  if (canEdit && isEditing) {
    return (
      <Input
        value={draftValue}
        onChange={(event) => {
          const sanitizedValue = sanitizeContributionInput(event.target.value)
          setDraftValue(sanitizedValue)
          onPreviewChange(cellKey, parseContributionInput(sanitizedValue))
        }}
        onBlur={() => {
          void handleCommit()
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            void handleCommit()
          }

          if (event.key === "Escape") {
            event.preventDefault()
            handleCancel()
          }
        }}
        autoFocus
        inputMode="decimal"
        disabled={isSaving}
        className="h-8 w-full min-w-24 bg-input text-right text-foreground tabular-nums placeholder:text-muted-foreground"
      />
    )
  }

  if (!canEdit) {
    return (
      <span
        className={cn(
          "block min-h-8 w-full min-w-24 px-2 py-1 text-right text-sm tabular-nums",
          value === null ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {value === null ? "-" : formatContributionValue(value)}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      disabled={isSaving}
      className={cn(
        "flex min-h-8 w-full min-w-24 items-center justify-end rounded-md px-2 py-1 text-right text-sm tabular-nums transition-colors hover:bg-muted/60",
        value === null ? "text-muted-foreground" : "text-foreground",
      )}
    >
      {value === null ? "-" : formatContributionValue(value)}
    </button>
  )
}

export function ContributionsEditableTable({
  canEditMemberValues = true,
  rows,
  sundays,
  offersBySunday,
  previewValues,
  savingCellKeys,
  emptyMemberMessage = "Nenhum contribuinte encontrado.",
  onPreviewChange,
  onCommitMemberValue,
  onOpenOfferDetails,
}: ContributionsEditableTableProps) {
  const offerTotalsBySunday = sundays.reduce<Record<string, number>>((accumulator, sunday) => {
    accumulator[sunday.date] = sumValues((offersBySunday[sunday.date] ?? []).map((entry) => entry.amount))
    return accumulator
  }, {})

  const offerRowTotal = sumValues(Object.values(offerTotalsBySunday))

  const memberRowsWithTotals = rows.map((row) => {
    const values = sundays.map((sunday) =>
      getDisplayMemberValue(
        previewValues,
        `${row.memberId}:${sunday.date}`,
        row.valuesBySunday[sunday.date] ?? null,
      ),
    )

    return {
      ...row,
      total: sumValues(values),
    }
  })

  const footerTotalsBySunday = sundays.reduce<Record<string, number>>((accumulator, sunday) => {
    accumulator[sunday.date] = sumValues([
      offerTotalsBySunday[sunday.date],
      ...memberRowsWithTotals.map((row) =>
        getDisplayMemberValue(
          previewValues,
          `${row.memberId}:${sunday.date}`,
          row.valuesBySunday[sunday.date] ?? null,
        ),
      ),
    ])
    return accumulator
  }, {})

  const footerGrandTotal = sumValues(Object.values(footerTotalsBySunday))

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-60">Contribuinte</TableHead>
            {sundays.map((sunday) => (
              <TableHead key={sunday.date} className="min-w-32 px-3 text-right">
                {sunday.label}
              </TableHead>
            ))}
            <TableHead className="min-w-36 px-3 text-right">Total</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow className="bg-muted/20 hover:bg-muted/30">
            <TableCell className="font-semibold text-foreground">Ofertas</TableCell>
            {sundays.map((sunday) => {
              const offerEntries = offersBySunday[sunday.date] ?? []
              const total = offerTotalsBySunday[sunday.date]

              return (
                <TableCell key={sunday.date} className="px-3">
                  {offerEntries.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => onOpenOfferDetails(sunday.date)}
                      className={cn(
                        getNumericCellClassName(),
                        "font-medium text-emerald-400 underline-offset-4 hover:underline",
                      )}
                    >
                      {formatContributionValue(total)}
                    </button>
                  ) : (
                    <span className={cn(getNumericCellClassName(), "block text-muted-foreground")}>-</span>
                  )}
                </TableCell>
              )
            })}
            <TableCell className="px-3">
              <span className={cn(getNumericCellClassName(), "block font-semibold text-emerald-400")}>
                {formatContributionValue(offerRowTotal)}
              </span>
            </TableCell>
          </TableRow>

          {memberRowsWithTotals.map((row) => (
            <TableRow key={row.memberId}>
              <TableCell className="font-medium text-foreground">{row.memberName}</TableCell>
              {sundays.map((sunday) => {
                const cellKey = `${row.memberId}:${sunday.date}`
                const visibleValue = getDisplayMemberValue(
                  previewValues,
                  cellKey,
                  row.valuesBySunday[sunday.date] ?? null,
                )

                return (
                  <TableCell key={cellKey} className="px-3">
                    <EditableContributionCell
                      canEdit={canEditMemberValues}
                      cellKey={cellKey}
                      value={visibleValue}
                      isSaving={savingCellKeys.has(cellKey)}
                      onPreviewChange={onPreviewChange}
                      onCommit={(amount) => onCommitMemberValue(row.memberId, sunday.date, amount)}
                    />
                  </TableCell>
                )
              })}
              <TableCell className="px-3">
                <span className={cn(getNumericCellClassName(), "block font-semibold text-foreground")}>
                  {row.total > 0 ? formatContributionValue(row.total) : "-"}
                </span>
              </TableCell>
            </TableRow>
          ))}

          {memberRowsWithTotals.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={sundays.length + 2}
                className="py-6 text-center text-sm text-muted-foreground"
              >
                {emptyMemberMessage}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>

        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell className="font-semibold text-foreground">Total geral</TableCell>
            {sundays.map((sunday) => (
              <TableCell key={sunday.date} className="px-3">
                <span className={cn(getNumericCellClassName(), "block font-semibold text-foreground")}>
                  {footerTotalsBySunday[sunday.date] > 0
                    ? formatContributionCurrency(footerTotalsBySunday[sunday.date])
                    : "-"}
                </span>
              </TableCell>
            ))}
            <TableCell className="px-3">
              <span className={cn(getNumericCellClassName(), "block font-semibold text-emerald-400")}>
                {formatContributionCurrency(footerGrandTotal)}
              </span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
