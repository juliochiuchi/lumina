import { useEffect, useState } from "react"

import { parseContributionInput, sanitizeContributionInput } from "@/lib/contributions"
import type { ContributionSunday } from "@/lib/opening-contributions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type OfferFormModalProps = {
  isOpen: boolean
  sundays: ContributionSunday[]
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: { dateSunday: string; amount: number }) => Promise<void>
}

export function OfferFormModal({
  isOpen,
  sundays,
  isSubmitting = false,
  onClose,
  onSubmit,
}: OfferFormModalProps) {
  const [dateSunday, setDateSunday] = useState("")
  const [amountValue, setAmountValue] = useState("")
  const [dateSundayError, setDateSundayError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setDateSunday(sundays[0]?.date ?? "")
    setAmountValue("")
    setDateSundayError(null)
    setAmountError(null)
  }, [isOpen, sundays])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedAmount = parseContributionInput(amountValue)
    const nextDateError = dateSunday ? null : "Domingo é obrigatório"
    const nextAmountError =
      parsedAmount && parsedAmount > 0 ? null : "Informe um valor maior que zero"

    setDateSundayError(nextDateError)
    setAmountError(nextAmountError)

    if (nextDateError || nextAmountError || parsedAmount === null) {
      return
    }

    await onSubmit({
      dateSunday,
      amount: parsedAmount,
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
        aria-labelledby="offer-form-title"
        aria-describedby="offer-form-description"
      >
        <div className="space-y-2">
          <h2 id="offer-form-title" className="text-xl font-semibold text-foreground">
            Nova oferta
          </h2>
          <p id="offer-form-description" className="text-sm text-muted-foreground">
            Informe o domingo e o valor da oferta para adicionar o lançamento ao mês selecionado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offer-date-sunday">Domingo</Label>
            <Select
              value={dateSunday}
              onValueChange={(value) => {
                setDateSunday(value)
                if (dateSundayError) setDateSundayError(null)
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="offer-date-sunday" className="bg-input text-foreground">
                <SelectValue placeholder="Selecione o domingo" />
              </SelectTrigger>
              <SelectContent>
                {sundays.map((sunday) => (
                  <SelectItem key={sunday.date} value={sunday.date}>
                    {sunday.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {dateSundayError ? <p className="text-sm text-destructive">{dateSundayError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer-amount">Valor</Label>
            <Input
              id="offer-amount"
              value={amountValue}
              onChange={(event) => {
                setAmountValue(sanitizeContributionInput(event.target.value))
                if (amountError) setAmountError(null)
              }}
              placeholder="0,00"
              inputMode="decimal"
              disabled={isSubmitting}
              className="bg-input text-foreground placeholder:text-muted-foreground"
            />
            {amountError ? <p className="text-sm text-destructive">{amountError}</p> : null}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Adicionar oferta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
