import { Pencil, Trash2, Tag, DollarSign, Clock3, ArrowUpRight, ArrowDownRight } from 'lucide-react'
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
    ? 'text-red-400 hover:bg-red-500/15 hover:text-red-300'
    : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-100'

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        aria-label={label}
        className={cn(
          'peer h-7 w-7 rounded-md transition-colors duration-150',
          toneClassName
        )}
      >
        {icon}
      </Button>
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-700/70 bg-zinc-950/95 px-2 py-0.5 text-[10px] font-medium text-zinc-200 opacity-0 shadow-md transition-opacity duration-150 peer-hover:opacity-100">
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

  const amountTextColor = variant === 'entry' ? 'text-emerald-400' : 'text-rose-400'
  const amountBgClass = variant === 'entry'
    ? 'bg-emerald-500/10 text-emerald-400'
    : 'bg-rose-500/10 text-rose-400'
  const rowAccentClass = variant === 'entry'
    ? 'hover:border-emerald-500/20'
    : 'hover:border-rose-500/20'

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(total)

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

  const formatCreatedAt = (createdAt?: string) => {
    if (!createdAt) return '—'

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(createdAt))
  }

  const IndicatorIcon = variant === 'entry' ? ArrowUpRight : ArrowDownRight

  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/55 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3 sm:px-5">
          <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-100">
            <DollarSign className="h-4 w-4 text-[#60a5fa]" />
            <span>{title}</span>
            <span className="ml-1 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
              0
            </span>
          </h3>

          <div className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-1.5', totalBgColorClass)}>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Total
            </span>
            <span className={cn('text-sm font-semibold tabular-nums', totalTextColorClass)}>
              {formattedTotal}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/40">
            <DollarSign className="h-6 w-6 text-[#60a5fa]/70" />
          </div>
          <p className="text-sm font-medium text-zinc-300">Nenhum registro encontrado</p>
          {canDelete ? (
            <p className="mt-0.5 text-xs text-zinc-500">Adicione o primeiro registro para começar</p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/55 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3 sm:px-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-100">
          <DollarSign className="h-4 w-4 text-[#60a5fa]" />
          <span>{title}</span>
          <span className="ml-1 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            {data.length}
          </span>
        </h3>

        <div className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-1.5', totalBgColorClass)}>
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            Total
          </span>
          <span className={cn('text-sm font-semibold tabular-nums', totalTextColorClass)}>
            {formattedTotal}
          </span>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto [scrollbar-color:rgba(113,113,122,0.6)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700/70">
        <ul className="divide-y divide-zinc-800/50">
          {data.map((item) => (
            <li
              key={item.id}
              className={cn(
                'group relative flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-zinc-800/30 sm:px-5',
                rowAccentClass
              )}
            >
              <div className={cn(
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                amountBgClass
              )}>
                <IndicatorIcon className="h-4.5 w-4.5" strokeWidth={2.25} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {item.description}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3 w-3 text-zinc-600" />
                    <span className="truncate text-zinc-400">{item.type}</span>
                  </span>
                  <span className="text-zinc-700">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3 w-3 text-zinc-600" />
                    <span className="tabular-nums text-zinc-400">{formatCreatedAt(item.createdAt)}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-1.5">
                {canEdit && onEdit ? (
                  <div className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <ActionButton
                      label="Editar"
                      tone="neutral"
                      onClick={() => onEdit(item)}
                      icon={<Pencil className="h-3.5 w-3.5" />}
                    />
                  </div>
                ) : null}
                {canDelete && onDelete ? (
                  <div className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <ActionButton
                      label="Excluir"
                      tone="danger"
                      onClick={() => onDelete(item)}
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                    />
                  </div>
                ) : null}

                <div className={cn(
                  'ml-1 rounded-md px-2 py-1 text-sm font-semibold tabular-nums',
                  amountTextColor
                )}>
                  {variant === 'entry' ? '+' : '-'} {formatCurrency(item.amount)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
