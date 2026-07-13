import { CalendarDays, Eye, Pencil, Trash2 } from "lucide-react"

import { formatCurrency } from "@/lib/currency"
import type { OpeningContributionWithTotal } from "@/services/openingContributionsService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OpeningContributionCardProps {
  canManage: boolean
  openingContribution: OpeningContributionWithTotal
  onView: (openingContribution: OpeningContributionWithTotal) => void
  onEdit: (openingContribution: OpeningContributionWithTotal) => void
  onDelete: (openingContribution: OpeningContributionWithTotal) => void
}

export function OpeningContributionCard({
  canManage,
  openingContribution,
  onView,
  onEdit,
  onDelete,
}: OpeningContributionCardProps) {
  return (
    <Card className="w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.7rem)] xl:w-[calc(25%-0.8rem)] border-border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{openingContribution.year}</p>
          <CardTitle className="mt-2 text-3xl font-bold truncate" title={openingContribution.month}>
            {openingContribution.month}
          </CardTitle>
        </div>
        <div className="rounded-full bg-muted p-2 text-muted-foreground">
          <CalendarDays className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <hr className="border-border" />

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Total arrecadado</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {formatCurrency(openingContribution.total_amount)}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onView(openingContribution)}
            aria-label="Visualizar abertura"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canManage ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(openingContribution)}
                aria-label="Editar abertura"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-rose-400 hover:text-rose-300"
                onClick={() => onDelete(openingContribution)}
                aria-label="Excluir abertura"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
