import { Pencil, Trash2, Tag, DollarSign, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CashFlowRecord } from '@/types/cash-flow'

interface CashFlowTableProps {
  title: string
  data: CashFlowRecord[]
  onDelete?: (item: CashFlowRecord) => void
  onEdit?: (item: CashFlowRecord) => void
  canDelete?: boolean
  canEdit?: boolean
  variant?: 'entry' | 'exit'
}

interface ActionButtonProps {
  label: string
  icon: React.ReactNode
  onClick: () => void
  tone: 'danger' | 'neutral'
}

function ActionButton({ label, icon, onClick, tone }: ActionButtonProps) {
  const toneClassName = tone === 'danger'
    ? 'border-red-500/30 bg-red-500/12 text-red-200 hover:border-red-400/50 hover:bg-red-500/20 hover:text-white'
    : 'border-zinc-600/60 bg-zinc-900/90 text-zinc-200 hover:border-zinc-500/80 hover:bg-zinc-800 hover:text-white'

  return (
    <div className="group relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        aria-label={label}
        className={cn(
          'h-8 w-8 rounded-full border shadow-sm transition-all duration-200',
          toneClassName
        )}
      >
        {icon}
      </Button>
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-zinc-700/70 bg-zinc-950/95 px-2.5 py-1 text-[11px] font-medium text-zinc-100 opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0.5 group-hover:opacity-100">
        {label}
      </span>
    </div>
  )
}

export function CashFlowTable({
  title,
  data,
  onDelete,
  onEdit,
  canDelete = true,
  canEdit = true,
  variant = 'entry',
}: CashFlowTableProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  const totalBgColorClass = variant === 'entry'
    ? 'border-emerald-500/20 bg-emerald-500/10'
    : 'border-rose-500/20 bg-rose-500/10'
  const totalTextColorClass = variant === 'entry' ? 'text-emerald-100' : 'text-rose-100'
  const accentBorderClass = variant === 'entry' ? 'before:bg-emerald-400/80' : 'before:bg-rose-400/80'
  const hasActions = (canDelete && onDelete) || (canEdit && onEdit)
  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(total)

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

  const formatCreatedAt = (createdAt?: string) => {
    if (!createdAt) return 'Data indisponivel'

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(createdAt))
  }

  if (data.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/55 p-5 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <h3 className="flex items-center justify-center gap-2 text-xl font-semibold text-zinc-100 sm:justify-start">
              <DollarSign className="h-5 w-5 text-[#60a5fa]" />
              <span>{title}</span>
            </h3>
          </div>

          <div className={cn('inline-flex flex-col items-center rounded-2xl border px-4 py-2.5 sm:items-end', totalBgColorClass)}>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
              Total acumulado
            </span>
            <span className={cn('mt-1 text-xl font-semibold', totalTextColorClass)}>
              {formattedTotal}
            </span>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-[#60a5fa]" />
          </div>
          <p className="text-zinc-400 text-lg">Nenhum registro encontrado</p>
          {canDelete ? (
            <p className="text-zinc-500 text-sm mt-1">Adicione o primeiro registro para começar</p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-900/55 backdrop-blur-sm">
      <div className="border-b border-zinc-800/50 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <h3 className="flex items-center justify-center gap-2 text-xl font-semibold text-zinc-100 sm:justify-start">
              <DollarSign className="h-5 w-5 text-[#60a5fa]" />
              <span>{title}</span>
            </h3>
          </div>

          <div className={cn('inline-flex flex-col items-center rounded-2xl border px-4 py-2.5 sm:items-end', totalBgColorClass)}>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
              Total acumulado
            </span>
            <span className={cn('mt-1 text-xl font-semibold sm:text-2xl', totalTextColorClass)}>
              {formattedTotal}
            </span>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-4 pr-1 [scrollbar-color:rgba(113,113,122,0.7)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-600/80 [&::-webkit-scrollbar-thumb:hover]:bg-zinc-500">
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className={cn(
                'relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/30 px-4 py-4 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.9)] transition-all duration-200 hover:border-zinc-700/80 hover:bg-zinc-900/40',
                'before:absolute before:bottom-4 before:left-0 before:top-4 before:w-px',
                accentBorderClass
              )}
            >
              <div className="mb-4 flex items-center justify-between gap-3 pl-3">
                {hasActions ? (
                  <div className="flex items-center gap-2">
                    {canDelete && onDelete ? (
                      <ActionButton
                        label="Excluir"
                        tone="danger"
                        onClick={() => onDelete(item)}
                        icon={<Trash2 className="h-4 w-4" />}
                      />
                    ) : null}
                    {canEdit && onEdit ? (
                      <ActionButton
                        label="Editar"
                        tone="neutral"
                        onClick={() => onEdit(item)}
                        icon={<Pencil className="h-4 w-4" />}
                      />
                    ) : null}
                  </div>
                ) : (
                  <div />
                )}

                <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-800/80 bg-zinc-950/60 px-3 py-1.5 text-sm text-zinc-400">
                  <Clock3 className="h-3.5 w-3.5 flex-shrink-0 text-zinc-500" />
                  <span className="truncate text-center">{formatCreatedAt(item.createdAt)}</span>
                </div>
              </div>

              <div className="grid items-center gap-3 pl-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                <div className="min-w-0">
                  <div className="line-clamp-2 text-base font-semibold leading-5 text-zinc-100">
                    {item.description}
                  </div>
                  <div className="mt-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                      <div className="inline-flex min-w-0 items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 flex-shrink-0 text-zinc-500" />
                        <span className="truncate">{item.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:justify-self-end">
                  <div className="flex min-h-[88px] min-w-[180px] flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3 text-center">
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                      Valor
                    </span>
                    <span className="mt-1 text-lg font-semibold leading-none text-zinc-100 sm:text-xl">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
