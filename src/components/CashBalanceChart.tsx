import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { type CashFlow } from '@/services/cashFlowService'

interface CashBalanceChartProps {
  data: CashFlow[]
  year: string
}

const MONTHS_ORDER = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function CashBalanceChart({ data, year }: CashBalanceChartProps) {
  const chartData = useMemo(() => {
    return MONTHS_ORDER.map(month => {
      const monthFlows = data.filter(d => d.regard_month === month)
      // If multiple flows exist for the same month, we sum their final balances.
      const finalBalance = monthFlows.reduce((acc, curr) => acc + curr.final_balance, 0)

      return {
        month: month.substring(0, 3), // Short month name: Jan, Fev, Mar...
        fullMonth: month,
        balance: finalBalance
      }
    })
  }, [data])

  const formatCurrency = (value: number, showDecimals: boolean = false) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    }).format(value)
  }

  return (
    <Card className="w-full border-border bg-card">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold">Evolução do Caixa</CardTitle>
        <CardDescription>Acompanhamento do saldo final no ano de {year}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            balance: {
              label: "Saldo Final",
              color: "hsl(var(--primary))"
            }
          }}
          className="h-[400px] w-full"
        >
          <LineChart data={chartData} margin={{ top: 20, left: 20, right: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              stroke="hsl(var(--muted-foreground))"
              width={80}
            />
            <ChartTooltip
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value: unknown) => formatCurrency(value as number, true)}
                  className="bg-card border-border text-foreground"
                />
              }
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--color-balance)"
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--color-balance)", strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
