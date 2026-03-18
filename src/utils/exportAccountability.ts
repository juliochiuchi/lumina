import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { CashFlowWithMovements } from '@/services/cashFlowService'
import { categoriesService } from '@/services/categoriesService'

export const exportAccountabilityToExcel = async (data: CashFlowWithMovements[], year: string) => {
  // Fetch categories to map UUID to name
  const categories = await categoriesService.getAll()
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name
    return acc
  }, {} as Record<string, string>)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // 1. Aggregate Inflows by Category
  const inflowCategories: Record<string, number> = {}
  let totalInflow = 0

  data.forEach((monthData) => {
    monthData.inflows.forEach((inflow) => {
      const categoryName = categoryMap[inflow.category] || 'Sem Categoria'
      const value = Number(inflow.inflow_value) || 0
      inflowCategories[categoryName] = (inflowCategories[categoryName] || 0) + value
      totalInflow += value
    })
  })

  // 2. Aggregate Outflows by Category
  const outflowCategories: Record<string, number> = {}
  let totalOutflow = 0

  data.forEach((monthData) => {
    monthData.outflows.forEach((outflow) => {
      const categoryName = categoryMap[outflow.category] || 'Sem Categoria'
      const value = Number(outflow.outflow_value) || 0
      outflowCategories[categoryName] = (outflowCategories[categoryName] || 0) + value
      totalOutflow += value
    })
  })

  // 3. Prepare Data for Excel
  // We'll create a layout with sections
  const wsData: (string | number | null)[][] = [
    [`Relatório de Prestação de Contas - ${year}`],
    [''], // Empty row
    ['ENTRADAS POR CATEGORIA'],
    ['Categoria', 'Valor Total'],
  ]

  // Add Inflow Categories
  Object.entries(inflowCategories).forEach(([category, value]) => {
    wsData.push([category, formatCurrency(value)])
  })
  wsData.push(['Total de Entradas', formatCurrency(totalInflow)])
  wsData.push(['']) // Empty row

  // Add Outflow Categories
  wsData.push(['SAÍDAS POR CATEGORIA'])
  wsData.push(['Categoria', 'Valor Total'])
  Object.entries(outflowCategories).forEach(([category, value]) => {
    wsData.push([category, formatCurrency(value)])
  })
  wsData.push(['Total de Saídas', formatCurrency(totalOutflow)])
  wsData.push(['']) // Empty row

  // Add Summary
  const balance = totalInflow - totalOutflow
  wsData.push(['RESUMO ANUAL'])
  wsData.push(['Total Entradas', formatCurrency(totalInflow)])
  wsData.push(['Total Saídas', formatCurrency(totalOutflow)])
  wsData.push(['Saldo Final', formatCurrency(balance)])

  // 4. Create Worksheet and Workbook
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Formatting (basic width)
  const wscols = [
    { wch: 40 }, // Column A width
    { wch: 20 }, // Column B width
  ]
  ws['!cols'] = wscols

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Prestação de Contas ${year}`)

  // 5. Generate Buffer and Download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' })

  saveAs(blob, `prestacao_contas_${year}.xlsx`)
}
