import { Pencil, Trash2, Calendar, Tag, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TruncatedText } from '@/components/ui/truncated-text'
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
  const dotColorClass = variant === 'entry' ? 'bg-[#4ade80]' : 'bg-[#f87171]'
  const totalBgColorClass = variant === 'entry' ? 'bg-emerald-500/10' : 'bg-rose-500/10'

  if (data.length === 0) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-xl border border-zinc-800/50">
        <h3 className="text-xl font-semibold text-zinc-100 mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#60a5fa]" />
          {title}
        </h3>
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
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 overflow-hidden">
      <div className="p-6 border-b border-zinc-800/50">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#60a5fa]" />
            {title}
          </h3>
          <div className={`px-4 py-2 rounded-lg ${totalBgColorClass}`}>
            <span className="text-sm text-zinc-400">Total:</span>
            <span className="ml-2 text-lg font-bold text-zinc-100">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="p-4 space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${dotColorClass} flex-shrink-0`}></div>
                    <TruncatedText
                      text={item.description}
                      className="text-zinc-100 font-medium"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{item.type}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                  <div className="min-w-0 text-right">
                    <div className="text-lg font-semibold text-zinc-100">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.amount)}
                    </div>
                  </div>

                  {canEdit && onEdit ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-zinc-300 hover:text-white hover:bg-zinc-700/40 h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : null}

                  {canDelete && onDelete ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
