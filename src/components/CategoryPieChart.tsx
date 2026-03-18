import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, Label } from 'recharts'
import { type CashFlowWithMovements } from '@/services/cashFlowService'
import { categoriesService, type Category } from '@/services/categoriesService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CategoryPieChartProps {
  data: CashFlowWithMovements[]
  year: string
}

const MONTHS_ORDER = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57", "#ffc0cb"
]

export function CategoryPieChart({ data, year }: CategoryPieChartProps) {
  // Use current month as default if possible, otherwise use January
  const currentMonthIndex = new Date().getMonth()
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS_ORDER[currentMonthIndex])
  const [flowType, setFlowType] = useState<"inflows" | "outflows">("outflows")
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    categoriesService.getAll()
      .then(setCategories)
      .catch(err => console.error("Erro ao buscar categorias no CategoryPieChart:", err))
  }, [])

  const getCategoryName = useMemo(() => (idOrName: string) => {
    if (!idOrName) return "Sem Categoria"
    const cat = categories.find(c => c.id === idOrName)
    return cat ? cat.name : idOrName
  }, [categories])

  const chartData = useMemo(() => {
    const monthFlows = data.filter(d => d.regard_month === selectedMonth)

    const categoryTotals: Record<string, number> = {}

    monthFlows.forEach(flow => {
      if (flowType === "inflows") {
        if (flow.inflows) {
          flow.inflows.forEach(inflow => {
            const cat = getCategoryName(inflow.category)
            categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(inflow.inflow_value)
          })
        }
        if (flow.redemption_application && Number(flow.redemption_application) > 0) {
          const cat = "Resgate Aplicação"
          categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(flow.redemption_application)
        }
      } else if (flowType === "outflows" && flow.outflows) {
        flow.outflows.forEach(outflow => {
          const cat = getCategoryName(outflow.category)
          categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(outflow.outflow_value)
        })
      }
    })

    return Object.entries(categoryTotals)
      .map(([category, value]) => {
        const id = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
        return { category, value, id }
      })
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        fill: `var(--color-${item.id})`,
        colorHex: COLORS[index % COLORS.length]
      }))
  }, [data, selectedMonth, flowType, getCategoryName])

  const totalValue = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Generate chart config dynamically based on categories
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {
      value: {
        label: "Valor",
        color: "hsl(var(--foreground))",
      },
    }

    chartData.forEach((item) => {
      config[item.id] = {
        label: item.category,
        color: item.colorHex
      }
    })

    return config
  }, [chartData])

  return (
    <Card className="w-full border-border bg-card">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <CardTitle className="text-white text-xl font-bold">Distribuição por Categoria</CardTitle>
          <CardDescription>Análise detalhada de {flowType === 'inflows' ? 'entradas' : 'saídas'} em {selectedMonth} de {year}</CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={flowType} onValueChange={(value: "inflows" | "outflows") => setFlowType(value)}>
            <SelectTrigger className="w-[140px] bg-card border-border text-foreground">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inflows">Entradas</SelectItem>
              <SelectItem value="outflows">Saídas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] bg-card border-border text-foreground">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS_ORDER.map((month) => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[350px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value: unknown, name: unknown, item: { payload?: { id?: string; fill?: string }; color?: string }) => {
                      const id = item?.payload?.id || String(name)
                      const label = chartConfig[id]?.label || String(name)
                      return (
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item?.color || item?.payload?.fill }} />
                            <span className="text-muted-foreground">{label}</span>
                          </div>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )
                    }}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="id"
                innerRadius={80}
                strokeWidth={2}
                stroke="hsl(var(--card))"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {formatCurrency(totalValue)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total de {flowType === 'inflows' ? 'Entradas' : 'Saídas'}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            Nenhum dado encontrado para este mês e tipo.
          </div>
        )}
      </CardContent>
    </Card>
  )
}