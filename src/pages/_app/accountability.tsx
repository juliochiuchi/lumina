import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { cashFlowService, type CashFlowWithMovements } from '@/services/cashFlowService'
import { CashBalanceChart } from '@/components/CashBalanceChart'
import { CashInOutBarChart } from '@/components/CashInOutBarChart'
import { GlobalLoading } from '@/components/ui/global-loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/_app/accountability')({
  component: AccountabilityPage,
})

function AccountabilityPage() {
  const [movements, setMovements] = useState<CashFlowWithMovements[]>([])
  const [loading, setLoading] = useState(false)

  // Use current year as default
  const currentYear = new Date().getFullYear().toString()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Generate a list of years for the dropdown (e.g., last 5 years + next year)
  const [years, setYears] = useState<string[]>([])

  useEffect(() => {
    const yearList = Array.from({ length: 6 }, (_, i) => (parseInt(currentYear) - 4 + i).toString()).reverse()
    setYears(yearList)
  }, [currentYear])

  const fetchMovements = async (year: string) => {
    setLoading(true)
    try {
      const result = await cashFlowService.getByYearWithMovements(year)
      setMovements(result || [])
    } catch (err) {
      console.error('Unexpected error fetching cash flows:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovements(selectedYear)
  }, [selectedYear])

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <GlobalLoading visible={loading} text="Carregando dados..." />

      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col items-center space-y-4 lg:flex-row lg:items-end md:justify-between md:space-y-0">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-white text-center lg:text-left">
              Prestação de Contas
            </h1>
            <p className="text-zinc-400 text-center lg:text-left">
              Visualize e analise o uso dos recursos da empresa através de gráficos
            </p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="w-full lg:w-48">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <CashBalanceChart data={movements} year={selectedYear} />
          <CashInOutBarChart data={movements} year={selectedYear} />
        </div>
      </div>
    </div>
  )
}
