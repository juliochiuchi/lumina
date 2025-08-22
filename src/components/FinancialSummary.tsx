import { DollarSign } from 'lucide-react'

interface FinancialSummaryProps {
  totalEntries: number
  totalExits: number
  balance: number
}

export function FinancialSummary({ totalEntries, totalExits, balance }: FinancialSummaryProps) {
  return (
    <div className="flex flex-row md:flex-col gap-6 mb-8">
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-900/20 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-400">Total de Entradas</h3>
            <p className="text-2xl font-bold text-green-400">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalEntries)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-900/20 rounded-lg">
            <DollarSign className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-400">Total de Saídas</h3>
            <p className="text-2xl font-bold text-red-400">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalExits)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 w-full">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            balance >= 0 ? 'bg-blue-900/20' : 'bg-red-900/20'
          }`}>
            <DollarSign className={`h-6 w-6 ${
              balance >= 0 ? 'text-blue-400' : 'text-red-400'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-400">Saldo do Mês</h3>
            <p className={`text-2xl font-bold ${
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