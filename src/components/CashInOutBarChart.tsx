import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { type CashFlowWithMovements } from '@/services/cashFlowService'

interface CashInOutBarChartProps {
  data: CashFlowWithMovements[]
  year: string
}

const MONTHS_ORDER = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function CashInOutBarChart({ data, year }: CashInOutBarChartProps) {
  const chartData = useMemo(() => {
    return MONTHS_ORDER.map(month => {
      const monthFlows = data.filter(d => d.regard_month === month)

      let totalInflows = 0
      let totalOutflows = 0

      monthFlows.forEach(flow => {
        if (flow.inflows) {
          totalInflows += flow.inflows.reduce((acc, curr) => acc + Number(curr.inflow_value), 0)
        }
        if (flow.redemption_application) {
          totalInflows += Number(flow.redemption_application)
        }
        if (flow.outflows) {
          totalOutflows += flow.outflows.reduce((acc, curr) => acc + Number(curr.outflow_value), 0)
        }
      })

      return {
        month: month.substring(0, 3), // Short month name: Jan, Fev, Mar...
        fullMonth: month,
        inflows: totalInflows,
        outflows: totalOutflows
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
        <CardTitle className="text-white text-xl font-bold">Entradas x Saídas</CardTitle>
        <CardDescription>Acompanhamento de entradas e saídas no ano de {year}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            inflows: {
              label: "Entradas",
              color: "hsl(var(--chart-2))"
            },
            outflows: {
              label: "Saídas",
              color: "hsl(var(--chart-5))"
            }
          }}
          className="h-[400px] w-full"
        >
          <BarChart data={chartData} margin={{ top: 20, left: 20, right: 20, bottom: 20 }}>
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
              cursor={{ fill: 'hsl(var(--muted/0.5))' }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value: unknown, name: string | number, item: { color?: string, payload?: { fill?: string } }) => {
                    const color = item?.color || item?.payload?.fill
                    return (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex flex-1 justify-between leading-none items-center">
                          <span className="text-muted-foreground mr-2">
                            {name === 'inflows' ? 'Entradas' : 'Saídas'}
                          </span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {formatCurrency(value as number, true)}
                          </span>
                        </div>
                      </>
                    )
                  }}
                  className="bg-card border-border text-foreground"
                />
              }
            />
            <ChartLegend content={<ChartLegendContent className="text-white" />} />
            <Bar
              dataKey="inflows"
              fill="var(--color-inflows)"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
            <Bar
              dataKey="outflows"
              fill="var(--color-outflows)"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
