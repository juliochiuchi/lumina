import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CalendarRange, PiggyBank, Scale, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { AnnualCategorySection } from '@/components/annual-presentation/AnnualCategorySection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GlobalLoading } from '@/components/ui/global-loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SessionExitButton } from '@/components/ui/session-exit-button'
import { formatCurrency } from '@/lib/currency'
import { categoriesService } from '@/services/categoriesService'
import { cashFlowService, type CashFlowWithMovements } from '@/services/cashFlowService'
import {
  getAnnualPresentationSummary,
  type AnnualPresentationSummary,
} from '@/utils/getAnnualPresentationSummary'

export const Route = createFileRoute('/_app/annual_presentation')({
  component: AnnualPresentationPage,
})

const EMPTY_SUMMARY: AnnualPresentationSummary = {
  revenueCategories: [],
  expenseCategories: [],
  totalRevenue: 0,
  totalExpense: 0,
}

const MONTHS_ORDER = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const

const MIN_ANNUAL_PRESENTATION_YEAR = 2026

function AnnualPresentationPage() {
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(Math.max(currentYear, MIN_ANNUAL_PRESENTATION_YEAR).toString())
  const [movements, setMovements] = useState<CashFlowWithMovements[]>([])
  const [summary, setSummary] = useState<AnnualPresentationSummary>(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(false)
  const totalBalance = summary.totalRevenue - summary.totalExpense

  const sortedMovements = useMemo(() => {
    return [...movements].sort((firstMovement, secondMovement) => {
      return MONTHS_ORDER.indexOf(firstMovement.regard_month as (typeof MONTHS_ORDER)[number]) -
        MONTHS_ORDER.indexOf(secondMovement.regard_month as (typeof MONTHS_ORDER)[number])
    })
  }, [movements])

  const januaryMovement = sortedMovements.find((movement) => movement.regard_month === 'Janeiro') ?? sortedMovements[0]
  const decemberMovement = sortedMovements.find((movement) => movement.regard_month === 'Dezembro')
  const lastMovement = sortedMovements[sortedMovements.length - 1]
  const endingMovement = decemberMovement ?? lastMovement
  const annualBankInitialBalance = Number(januaryMovement?.initial_balance || 0)
  const annualBankFinalBalance = Number(endingMovement?.final_balance || 0)
  const annualBankBalance = annualBankInitialBalance - annualBankFinalBalance
  const annualInvestmentInitialBalance = Number(januaryMovement?.investment_application || 0)
  const annualInvestmentFinalBalance = Number(endingMovement?.investment_application || 0)
  const annualInvestmentBalance = annualInvestmentInitialBalance - annualInvestmentFinalBalance
  const endingMonthLabel = endingMovement?.regard_month ?? 'Último mês'

  const years = useMemo(() => {
    const maxYear = Math.max(currentYear + 1, MIN_ANNUAL_PRESENTATION_YEAR)
    const length = maxYear - MIN_ANNUAL_PRESENTATION_YEAR + 1
    return Array.from({ length }, (_, index) => (maxYear - index).toString())
  }, [currentYear])

  useEffect(() => {
    async function loadAnnualSummary(year: string) {
      setLoading(true)

      try {
        const [movements, categories] = await Promise.all([
          cashFlowService.getByYearWithMovements(year),
          categoriesService.getAll(),
        ])

        setMovements(movements)
        setSummary(getAnnualPresentationSummary(movements, categories))
      } catch (error) {
        console.error('Erro ao carregar apresentação anual:', error)
        setMovements([])
        setSummary(EMPTY_SUMMARY)
      } finally {
        setLoading(false)
      }
    }

    void loadAnnualSummary(selectedYear)
  }, [selectedYear])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalLoading visible={loading} text="Carregando apresentação anual..." />

      <div className="container mx-auto max-w-7xl space-y-6 p-4 sm:space-y-8 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <SessionExitButton aria-label="Encerrar sessão" onClick={() => navigate({ to: '/' })}>
            Encerrar sessão
          </SessionExitButton>
        </div>

        <div className="flex w-full flex-col gap-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-sm text-muted-foreground">
                  <CalendarRange className="h-4 w-4" />
                  Consolidado anual
                </div>

                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Apresentação Anual
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                    Acompanhe o total do ano por categoria de receita e despesa em uma visualização simples, limpa e organizada.
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-48">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="border-border bg-background">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <AnnualCategorySection
            title="Receitas"
            description={`Soma total de receitas por categoria em ${selectedYear}.`}
            totalLabel="Total anual de receitas"
            totalValue={summary.totalRevenue}
            categories={summary.revenueCategories}
            emptyMessage="Nenhuma receita encontrada para o ano selecionado."
            icon={TrendingUp}
            tone="revenue"
          />

          <AnnualCategorySection
            title="Despesas"
            description={`Soma total de despesas por categoria em ${selectedYear}.`}
            totalLabel="Total anual de despesas"
            totalValue={summary.totalExpense}
            categories={summary.expenseCategories}
            emptyMessage="Nenhuma despesa encontrada para o ano selecionado."
            icon={TrendingDown}
            tone="expense"
          />

          <Card className="border-border bg-card">
            <CardHeader className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-sky-500/10 p-3 text-sky-400">
                  <Scale className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xl text-foreground">Saldo Total do Ano</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Resultado da igualdade entre o total de receitas e o total de despesas no ano selecionado.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                <p className="text-sm text-muted-foreground">Receitas - despesas</p>
                <p className={`mt-2 text-3xl font-semibold tracking-tight ${totalBalance >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                  {formatCurrency(totalBalance)}
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                {formatCurrency(summary.totalRevenue)} - {formatCurrency(summary.totalExpense)} ={' '}
                <span className={totalBalance >= 0 ? 'font-semibold text-sky-400' : 'font-semibold text-rose-400'}>
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                  <Wallet className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xl text-foreground">Saldo Bancário Anual</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Resultado do saldo inicial de janeiro menos o saldo final de dezembro, com fallback para o último mês com movimentação.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                <p className="text-sm text-muted-foreground">Saldo inicial de janeiro - saldo final de {endingMonthLabel.toLowerCase()}</p>
                <p className={`mt-2 text-3xl font-semibold tracking-tight ${annualBankBalance >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {formatCurrency(annualBankBalance)}
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                {formatCurrency(annualBankInitialBalance)} - {formatCurrency(annualBankFinalBalance)} ={' '}
                <span className={annualBankBalance >= 0 ? 'font-semibold text-amber-400' : 'font-semibold text-rose-400'}>
                  {formatCurrency(annualBankBalance)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
                  <PiggyBank className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xl text-foreground">Saldo de Aplicação Anual</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Resultado do valor de aplicação de janeiro menos o valor de aplicação de dezembro, com fallback para o último mês com movimentação.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                <p className="text-sm text-muted-foreground">
                  Aplicação de janeiro - aplicação de {endingMonthLabel.toLowerCase()}
                </p>
                <p className={`mt-2 text-3xl font-semibold tracking-tight ${annualInvestmentBalance >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
                  {formatCurrency(annualInvestmentBalance)}
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                {formatCurrency(annualInvestmentInitialBalance)} - {formatCurrency(annualInvestmentFinalBalance)} ={' '}
                <span className={annualInvestmentBalance >= 0 ? 'font-semibold text-violet-400' : 'font-semibold text-rose-400'}>
                  {formatCurrency(annualInvestmentBalance)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center gap-5 px-6 py-8 text-center sm:px-10 sm:py-9">
              <img
                src="/logo-ipim-verde.png"
                alt="Logo da Igreja Presbiteriana Independente de Macaubal"
                className="h-20 w-auto sm:h-24"
              />

              <div className="max-w-2xl space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400 sm:text-sm">
                  Igreja Presbiteriana Independente de Macaubal
                </p>

                <blockquote className="mx-auto rounded-2xl border border-border/70 bg-background/40 px-5 py-4 sm:px-6">
                  <p className="text-sm leading-7 text-zinc-200 sm:text-base">
                    Cada um contribua segundo propôs no seu coração; não com tristeza, ou por
                    necessidade; porque Deus ama ao que dá com alegria.
                  </p>
                  <footer className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                    2 Coríntios 9.7
                  </footer>
                </blockquote>
              </div>
            </CardContent>
          </Card>

          {!loading && summary.revenueCategories.length === 0 && summary.expenseCategories.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-border bg-background/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                O ano selecionado ainda não possui movimentações consolidadas.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/">Ir para fluxo de caixa</Link>
              </Button>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
