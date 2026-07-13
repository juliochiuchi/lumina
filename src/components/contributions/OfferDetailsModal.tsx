import { Trash2 } from "lucide-react"

import { formatContributionCurrency } from "@/lib/contributions"
import type { ContributionSunday } from "@/lib/opening-contributions"
import type { MonthlyContributionOfferEntry } from "@/services/monthlyContributionsService"
import { Button } from "@/components/ui/button"

type OfferDetailsModalProps = {
  isOpen: boolean
  canManageOffers?: boolean
  sunday: ContributionSunday | null
  entries: MonthlyContributionOfferEntry[]
  deletingOfferId?: string | null
  onClose: () => void
  onDeleteOffer: (offerId: string) => Promise<void>
}

export function OfferDetailsModal({
  isOpen,
  canManageOffers = true,
  sunday,
  entries,
  deletingOfferId = null,
  onClose,
  onDeleteOffer,
}: OfferDetailsModalProps) {
  if (!isOpen || !sunday) {
    return null
  }

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-details-title"
        aria-describedby="offer-details-description"
      >
        <div className="space-y-2">
          <h2 id="offer-details-title" className="text-xl font-semibold text-foreground">
            Ofertas do {sunday.label}
          </h2>
          <p id="offer-details-description" className="text-sm text-muted-foreground">
            Confira todas as ocorrências registradas para este domingo.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {entries.length > 0 ? (
            <>
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3"
                >
                  <div className="space-y-1">
                    <span className="block font-medium text-foreground">Oferta {index + 1}</span>
                    <span className="block text-sm text-emerald-400">{formatContributionCurrency(entry.amount)}</span>
                  </div>
                  {canManageOffers ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={deletingOfferId === entry.id}
                      onClick={() => {
                        void onDeleteOffer(entry.id)
                      }}
                      aria-label={`Excluir oferta ${index + 1}`}
                      title="Excluir oferta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              ))}

              {entries.length > 1 ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <span className="font-semibold text-foreground">Soma das ocorrências</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {formatContributionCurrency(totalAmount)}
                  </span>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhuma oferta registrada neste domingo.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
