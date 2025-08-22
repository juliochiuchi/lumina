import { Trash2, Calendar, Tag, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CashFlowTableProps {
  title: string
  data: Array<{ id: string; description: string; type: string; amount: number; date: string }>
  onDelete: (id: string) => void
}

export function CashFlowTable({ title, data, onDelete }: CashFlowTableProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0)

  if (data.length === 0) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-xl border border-zinc-800/50">
        <h3 className="text-xl font-semibold text-zinc-100 mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-zinc-400" />
          {title}
        </h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-lg">Nenhum registro encontrado</p>
          <p className="text-zinc-500 text-sm mt-1">Adicione o primeiro registro para começar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 overflow-hidden">
      <div className="p-6 border-b border-zinc-800/50">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-zinc-400" />
            {title}
          </h3>
          <div className="px-4 py-2 bg-zinc-800/50 rounded-lg">
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
          {data.map((item, index) => (
            <div 
              key={item.id} 
              className="group relative bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                    <h4 className="text-zinc-100 font-medium truncate">{item.description}</h4>
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
                
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-zinc-100">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.amount)}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}