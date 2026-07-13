import { CalendarDays, Coins } from "lucide-react"

import { formatCurrency } from "@/lib/currency"
import type { OpeningContributionWithTotal } from "@/services/openingContributionsService"
import { Button } from "@/components/ui/button"

interface OpeningContributionDetailsModalProps {
  isOpen: boolean
  openingContribution: OpeningContributionWithTotal | null
  onClose: () => void
}

export function OpeningContributionDetailsModal({
  isOpen,
  openingContribution,
  onClose,
}: OpeningContributionDetailsModalProps) {
  if (!isOpen || !openingContribution) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="opening-contribution-details-title"
      >
        <div className="space-y-2">
          <h2 id="opening-contribution-details-title" className="text-xl font-semibold text-foreground">
            Abertura de contribuições
          </h2>
          <p className="text-sm text-muted-foreground">
            Visualize os dados consolidados da abertura selecionada.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ano</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{openingContribution.year}</p>
              </div>
              <div className="rounded-full bg-muted p-2 text-muted-foreground">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Mês</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{openingContribution.month}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total arrecadado</p>
                <div className="mt-1 flex items-center gap-2 text-emerald-400">
                  <Coins className="h-4 w-4" />
                  <p className="text-lg font-semibold">{formatCurrency(openingContribution.total_amount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
