import { Pencil, Trash2, Tag, DollarSign, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const editButtonClass = 'h-9 border border-zinc-600/60 bg-zinc-800/80 px-3 text-zinc-200 hover:bg-zinc-700 hover:text-white'

  const formatCreatedAt = (createdAt?: string) => {
    if (!createdAt) return 'Data indisponivel'

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(createdAt))
  }

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

      <div className="max-h-96 overflow-y-auto pr-1 [scrollbar-color:rgba(113,113,122,0.7)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-600/80 [&::-webkit-scrollbar-thumb:hover]:bg-zinc-500">
        <div className="p-4 space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-4 transition-all duration-200 hover:border-zinc-600/60 hover:bg-zinc-800/50"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${dotColorClass}`}></div>
                    <span className="truncate text-base font-semibold text-zinc-100">
                      {item.description}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-900/40 px-2.5 py-1.5 text-sm text-zinc-300">
                      <Tag className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Categoria: {item.type}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-900/40 px-2.5 py-1.5 text-sm text-zinc-300">
                      <Clock3 className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Cadastro: {formatCreatedAt(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-zinc-100 md:text-right">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit && onEdit ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className={editButtonClass}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    ) : null}

                    {canDelete && onDelete ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item)}
                        className="h-9 border border-red-500/20 bg-red-500/10 px-3 text-red-300 hover:bg-red-500/20 hover:text-white"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    ) : null}
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
