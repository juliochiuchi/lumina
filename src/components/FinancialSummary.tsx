import { DollarSign } from 'lucide-react'

interface FinancialSummaryProps {
  totalEntries: number
  totalExits: number
  balance: number
}

export function FinancialSummary({ totalEntries, totalExits, balance }: FinancialSummaryProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="bg-zinc-900 p-4 sm:p-6 rounded-lg border border-zinc-800 flex-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-900/20 rounded-lg flex-shrink-0">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-zinc-400">Total de Entradas</h3>
            <p className="text-lg sm:text-2xl font-bold text-green-400 truncate">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalEntries)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 p-4 sm:p-6 rounded-lg border border-zinc-800 flex-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-900/20 rounded-lg flex-shrink-0">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-zinc-400">Total de Saídas</h3>
            <p className="text-lg sm:text-2xl font-bold text-red-400 truncate">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalExits)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 p-4 sm:p-6 rounded-lg border border-zinc-800 flex-1">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg flex-shrink-0 ${
            balance >= 0 ? 'bg-blue-900/20' : 'bg-red-900/20'
          }`}>
            <DollarSign className={`h-5 w-5 sm:h-6 sm:w-6 ${
              balance >= 0 ? 'text-blue-400' : 'text-red-400'
            }`} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-zinc-400">Saldo do Mês</h3>
            <p className={`text-lg sm:text-2xl font-bold truncate ${
              balance >= 0 ? 'text-blue-400' : 'text-red-400'
            }`}>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(balance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}