import { useMemo, useState } from 'react'
import { Search, Tag, Clock3, X, ArrowUpRight, ArrowDownRight, FilterX } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CashFlowRecord } from '@/types/cash-flow'

interface CashFlowDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: CashFlowRecord[]
  categories: string[]
  variant?: 'entry' | 'exit'
}

export function CashFlowDetailsModal({
  isOpen,
  onClose,
  title,
  data,
  categories,
  variant = 'entry',
}: CashFlowDetailsModalProps) {
  const [descriptionFilter, setDescriptionFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const IndicatorIcon = variant === 'entry' ? ArrowUpRight : ArrowDownRight
  const amountColor = variant === 'entry' ? 'text-emerald-400' : 'text-rose-400'
  const amountBg = variant === 'entry'
    ? 'bg-emerald-500/10 text-emerald-400'
    : 'bg-rose-500/10 text-rose-400'
  const totalBg = variant === 'entry'
    ? 'border-emerald-500/20 bg-emerald-500/10'
    : 'border-rose-500/20 bg-rose-500/10'
  const totalText = variant === 'entry' ? 'text-emerald-100' : 'text-rose-100'

  const filteredData = useMemo(() => {
    const query = descriptionFilter.trim().toLowerCase()

    return data.filter((item) => {
      if (query && !item.description.toLowerCase().includes(query)) return false
      if (categoryFilter && item.type !== categoryFilter) return false
      return true
    })
  }, [data, descriptionFilter, categoryFilter])

  const filteredTotal = useMemo(
    () => filteredData.reduce((sum, item) => sum + item.amount, 0),
    [filteredData],
  )

  const hasActiveFilters = descriptionFilter.trim() !== '' || categoryFilter !== null

  const clearFilters = () => {
    setDescriptionFilter('')
    setCategoryFilter(null)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
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

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cash-flow-details-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/60 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="cash-flow-details-title"
              className="flex items-center gap-2 text-base font-semibold text-zinc-100"
            >
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', amountBg)}>
                <IndicatorIcon className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <span className="truncate">{title}</span>
              <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                {filteredData.length}
              </span>
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Consulte e filtre os registros. Os totais refletem apenas o que estiver visível.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar"
            className="h-8 w-8 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 border-b border-zinc-800/60 px-5 py-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-end">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="text"
                placeholder="Buscar por descrição..."
                value={descriptionFilter}
                onChange={(e) => setDescriptionFilter(e.target.value)}
                className="h-9 pl-9 text-sm placeholder:text-zinc-600"
              />
            </div>
            <div>
              <Select
                value={categoryFilter ?? ''}
                onValueChange={(v) => setCategoryFilter(v || null)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="h-9 gap-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40"
            >
              <FilterX className="h-3.5 w-3.5" />
              Limpar
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 [scrollbar-color:rgba(113,113,122,0.6)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700/70">
          {filteredData.length > 0 ? (
            <ul className="divide-y divide-zinc-800/50">
              {filteredData.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-center gap-3 py-2.5"
                >
                  <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md', amountBg)}>
                    <IndicatorIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">{item.description}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
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
                  <div className={cn('flex-shrink-0 rounded-md px-2 py-1 text-sm font-semibold tabular-nums', amountColor)}>
                    {variant === 'entry' ? '+' : '-'} {formatCurrency(item.amount)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/40">
                <Search className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Nenhum registro encontrado</p>
              {hasActiveFilters ? (
                <p className="mt-0.5 text-xs text-zinc-500">
                  Ajuste os filtros ou limpe para ver todos os registros.
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-800/60 bg-zinc-900/40 px-5 py-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Total exibido
            </span>
            <span className="text-xs text-zinc-400">
              {filteredData.length} de {data.length} registro{data.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-1.5', totalBg)}>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Soma
            </span>
            <span className={cn('text-sm font-semibold tabular-nums', totalText)}>
              {formatCurrency(filteredTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
