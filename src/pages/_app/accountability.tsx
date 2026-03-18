import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { cashFlowService, type CashFlowWithMovements } from '@/services/cashFlowService'
import { CashBalanceChart } from '@/components/CashBalanceChart'
import { CashInOutBarChart } from '@/components/CashInOutBarChart'
import { CategoryPieChart } from '@/components/CategoryPieChart'
import { FinancialSummary } from '@/components/FinancialSummary'
import { GlobalLoading } from '@/components/ui/global-loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportAccountabilityToExcel } from '@/utils/exportAccountability'

export const Route = createFileRoute('/_app/accountability')({
  component: AccountabilityPage,
})

function AccountabilityPage() {
  const [movements, setMovements] = useState<CashFlowWithMovements[]>([])
  const [loading, setLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

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

  const totalEntries = movements.reduce((acc, curr) => {
    const inflowSum = curr.inflows?.reduce((sum, inflow) => sum + Number(inflow.inflow_value), 0) || 0
    return acc + inflowSum
  }, 0)

  const totalRedemptions = movements.reduce((acc, curr) => {
    return acc + Number(curr.redemption_application || 0)
  }, 0)

  const totalExits = movements.reduce((acc, curr) => {
    const outflowSum = curr.outflows?.reduce((sum, outflow) => sum + Number(outflow.outflow_value), 0) || 0
    return acc + outflowSum
  }, 0)

  const balance = totalEntries - totalExits

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <GlobalLoading visible={loading} text="Carregando dados..." />

      <div className="mb-6 sm:mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Home
        </Link>
      </div>

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

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <Button
              variant="outline"
              onClick={async () => {
                setIsExporting(true)
                try {
                  await exportAccountabilityToExcel(movements, selectedYear)
                } finally {
                  setIsExporting(false)
                }
              }}
              disabled={loading || isExporting || movements.length === 0}
              className="w-full sm:w-auto bg-card border-border text-foreground hover:bg-zinc-800"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Exportar Excel'}
            </Button>
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

        <FinancialSummary
          totalEntries={totalEntries}
          totalExits={totalExits}
          balance={balance}
          totalEntriesWithRedemption={totalEntries + totalRedemptions}
          balanceWithRedemption={balance + totalRedemptions}
          balanceTitle="Saldo do Ano"
        />

        <div className="grid grid-cols-1 gap-6">
          <CashBalanceChart data={movements} year={selectedYear} />
          <CashInOutBarChart data={movements} year={selectedYear} />
          <CategoryPieChart data={movements} year={selectedYear} />
        </div>
      </div>
    </div>
  )
}
