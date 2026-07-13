import { useEffect, useMemo, useState } from "react"

import {
  OPENING_CONTRIBUTION_MONTHS,
  type OpeningContributionMonth,
  normalizeOpeningContributionMonth,
  normalizeOpeningContributionYear,
} from "@/lib/opening-contributions"
import type { OpeningContribution } from "@/services/openingContributionsService"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type OpeningContributionFormPayload = {
  year: string
  month: string
}

interface OpeningContributionFormModalProps {
  isOpen: boolean
  openingContribution: OpeningContribution | null
  yearOptions: string[]
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: OpeningContributionFormPayload) => Promise<void>
}

export function OpeningContributionFormModal({
  isOpen,
  openingContribution,
  yearOptions,
  isSubmitting = false,
  onClose,
  onSubmit,
}: OpeningContributionFormModalProps) {
  const currentYear = new Date().getFullYear().toString()
  const currentMonth = OPENING_CONTRIBUTION_MONTHS[new Date().getMonth()]
  const isEditing = openingContribution !== null
  const [yearValue, setYearValue] = useState(currentYear)
  const [monthValue, setMonthValue] = useState<string>(currentMonth)
  const [yearError, setYearError] = useState<string | null>(null)
  const [monthError, setMonthError] = useState<string | null>(null)

  const fallbackYear = useMemo(() => {
    if (yearOptions.includes(currentYear)) {
      return currentYear
    }

    if (yearOptions.length > 0) {
      return yearOptions[0]
    }

    return currentYear
  }, [currentYear, yearOptions])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (isEditing && openingContribution) {
      setYearValue(normalizeOpeningContributionYear(openingContribution.year))
      setMonthValue(normalizeOpeningContributionMonth(openingContribution.month))
      setYearError(null)
      setMonthError(null)
      return
    }

    setYearValue(fallbackYear)
    setMonthValue(currentMonth)
    setYearError(null)
    setMonthError(null)
  }, [currentMonth, fallbackYear, isEditing, isOpen, openingContribution])

  if (!isOpen) return null

  const title = openingContribution ? "Editar abertura" : "Nova abertura"
  const description = openingContribution
    ? "Atualize o ano e o mês da abertura de contribuições."
    : "Selecione o ano e o mês para cadastrar uma nova abertura de contribuições."

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedYear = normalizeOpeningContributionYear(yearValue)
    const normalizedMonth = normalizeOpeningContributionMonth(monthValue)

    const nextYearError = normalizedYear ? null : "Ano é obrigatório"
    const nextMonthError = normalizedMonth ? null : "Mês é obrigatório"

    setYearError(nextYearError)
    setMonthError(nextMonthError)

    if (nextYearError || nextMonthError) {
      return
    }

    await onSubmit({
      year: normalizedYear,
      month: normalizedMonth,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={() => {
        if (!isSubmitting) onClose()
      }}
      role="presentation"
    >
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="opening-contribution-form-title"
        aria-describedby="opening-contribution-form-description"
      >
        <div className="space-y-2">
          <h2 id="opening-contribution-form-title" className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p id="opening-contribution-form-description" className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opening-contribution-year">Ano</Label>
            <Select
              value={yearValue}
              onValueChange={(value) => {
                setYearValue(value || openingContribution?.year as string)
                if (yearError) setYearError(null)
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="opening-contribution-year" className="bg-input text-foreground">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {yearError ? (
              <p className="text-sm text-destructive">{yearError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening-contribution-month">Mês</Label>
            <Select
              value={monthValue}
              onValueChange={(value) => {
                setMonthValue(value || openingContribution?.month as OpeningContributionMonth)
                if (monthError) setMonthError(null)
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="opening-contribution-month" className="bg-input text-foreground">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {OPENING_CONTRIBUTION_MONTHS.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {monthError ? (
              <p className="text-sm text-destructive">{monthError}</p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : openingContribution ? "Salvar alterações" : "Cadastrar abertura"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
