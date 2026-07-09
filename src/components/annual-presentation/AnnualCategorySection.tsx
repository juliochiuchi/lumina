import type { LucideIcon } from 'lucide-react'

import { formatCurrency } from '@/lib/currency'
import type { AnnualCategoryTotal } from '@/utils/getAnnualPresentationSummary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type AnnualCategorySectionProps = {
  title: string
  description: string
  totalLabel: string
  totalValue: number
  categories: AnnualCategoryTotal[]
  emptyMessage: string
  icon: LucideIcon
  tone: 'revenue' | 'expense'
}

const toneStyles = {
  revenue: {
    badge: 'bg-emerald-500/10 text-emerald-400',
    total: 'text-emerald-400',
  },
  expense: {
    badge: 'bg-rose-500/10 text-rose-400',
    total: 'text-rose-400',
  },
} as const

export function AnnualCategorySection({
  title,
  description,
  totalLabel,
  totalValue,
  categories,
  emptyMessage,
  icon: Icon,
  tone,
}: AnnualCategorySectionProps) {
  const styles = toneStyles[tone]

  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-3 ${styles.badge}`}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-xl text-foreground">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/60 p-4">
          <p className="text-sm text-muted-foreground">{totalLabel}</p>
          <p className={`mt-2 text-3xl font-semibold tracking-tight ${styles.total}`}>
            {formatCurrency(totalValue)}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-background/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{category.name}</p>
                  <p className="text-sm text-muted-foreground">Total acumulado no ano</p>
                </div>

                <p className={`pl-4 text-right text-sm font-semibold sm:text-base ${styles.total}`}>
                  {formatCurrency(category.total)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-background/30 px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
