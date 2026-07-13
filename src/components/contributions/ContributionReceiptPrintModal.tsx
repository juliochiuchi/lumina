import { useEffect, useMemo, useState } from "react"

import type { MonthlyContributionSheet } from "@/services/monthlyContributionsService"
import { contributionReceiptService } from "@/services/contributionReceiptService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ContributionReceiptPrintModalProps = {
  isOpen: boolean
  sheet: MonthlyContributionSheet | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: {
    dateSunday: string
    namePersonHelping: string
    rolePersonHelping: string
    printWindow: Window
  }) => Promise<void>
}

export function ContributionReceiptPrintModal({
  isOpen,
  sheet,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ContributionReceiptPrintModalProps) {
  const sundayOptions = useMemo(() => contributionReceiptService.getSundayOptions(sheet), [sheet])
  const [dateSunday, setDateSunday] = useState("")
  const [namePersonHelping, setNamePersonHelping] = useState("")
  const [rolePersonHelping, setRolePersonHelping] = useState("")
  const [dateSundayError, setDateSundayError] = useState<string | null>(null)
  const [namePersonHelpingError, setNamePersonHelpingError] = useState<string | null>(null)
  const [rolePersonHelpingError, setRolePersonHelpingError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setDateSunday(sundayOptions[0]?.sunday.date ?? "")
    setNamePersonHelping("")
    setRolePersonHelping("")
    setDateSundayError(null)
    setNamePersonHelpingError(null)
    setRolePersonHelpingError(null)
  }, [isOpen, sundayOptions])

  if (!isOpen) {
    return null
  }

  const selectedSundayOption = sundayOptions.find((option) => option.sunday.date === dateSunday) ?? null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = namePersonHelping.trim()
    const trimmedRole = rolePersonHelping.trim()

    const nextDateSundayError = dateSunday ? null : "Selecione o domingo do recibo"
    const nextNameError = trimmedName ? null : "Informe o nome de quem vai assinar"
    const nextRoleError = trimmedRole ? null : "Informe o cargo de quem vai assinar"

    setDateSundayError(nextDateSundayError)
    setNamePersonHelpingError(nextNameError)
    setRolePersonHelpingError(nextRoleError)

    if (nextDateSundayError || nextNameError || nextRoleError) {
      return
    }

    const printWindow = contributionReceiptService.openPrintWindow()

    await onSubmit({
      dateSunday,
      namePersonHelping: trimmedName,
      rolePersonHelping: trimmedRole,
      printWindow,
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
        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-print-title"
        aria-describedby="receipt-print-description"
      >
        <div className="space-y-2">
          <h2 id="receipt-print-title" className="text-xl font-semibold text-foreground">
            Configurar impressão do recibo
          </h2>
          <p id="receipt-print-description" className="text-sm text-muted-foreground">
            Escolha o domingo e informe quem vai assinar junto com a tesoureira no recibo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receipt-date-sunday">Domingo</Label>
            <Select
              value={dateSunday}
              onValueChange={(value) => {
                setDateSunday(value)
                if (dateSundayError) setDateSundayError(null)
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="receipt-date-sunday" className="bg-input text-foreground">
                <SelectValue placeholder="Selecione o domingo" />
              </SelectTrigger>
              <SelectContent>
                {sundayOptions.map((option) => (
                  <SelectItem key={option.sunday.date} value={option.sunday.date}>
                    {option.sunday.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {dateSundayError ? <p className="text-sm text-destructive">{dateSundayError}</p> : null}
          </div>

          {selectedSundayOption ? (
            <div className="rounded-lg border border-border bg-background/50 p-4">
              <p className="text-sm font-medium text-foreground">Totais do domingo selecionado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Dízimos: {selectedSundayOption.totalTithe.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                Ofertas: {selectedSundayOption.totalOffer.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm font-medium text-foreground">
                Total geral: {selectedSundayOption.totalGeneral.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="receipt-person-helping-name">Nome da pessoa ajudante</Label>
            <Input
              id="receipt-person-helping-name"
              value={namePersonHelping}
              onChange={(event) => {
                setNamePersonHelping(event.target.value)
                if (namePersonHelpingError) setNamePersonHelpingError(null)
              }}
              placeholder="Nome completo"
              disabled={isSubmitting}
              className="bg-input text-foreground placeholder:text-muted-foreground"
            />
            {namePersonHelpingError ? <p className="text-sm text-destructive">{namePersonHelpingError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt-person-helping-role">Cargo da pessoa ajudante</Label>
            <Input
              id="receipt-person-helping-role"
              value={rolePersonHelping}
              onChange={(event) => {
                setRolePersonHelping(event.target.value)
                if (rolePersonHelpingError) setRolePersonHelpingError(null)
              }}
              placeholder="Ex.: Auxiliar de tesouraria"
              disabled={isSubmitting}
              className="bg-input text-foreground placeholder:text-muted-foreground"
            />
            {rolePersonHelpingError ? <p className="text-sm text-destructive">{rolePersonHelpingError}</p> : null}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || sundayOptions.length === 0}>
              {isSubmitting ? "Gerando recibo..." : "Abrir recibo para impressão"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
