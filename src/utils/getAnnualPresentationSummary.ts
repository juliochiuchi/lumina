import type { Category } from '@/services/categoriesService'
import type { CashFlowWithMovements } from '@/services/cashFlowService'

export type AnnualCategoryTotal = {
  name: string
  total: number
}

export type AnnualPresentationSummary = {
  revenueCategories: AnnualCategoryTotal[]
  expenseCategories: AnnualCategoryTotal[]
  totalRevenue: number
  totalExpense: number
}

const UNCATEGORIZED_LABEL = 'Sem categoria'
const REDEMPTION_LABEL = 'Resgate aplicação'

function resolveCategoryName(categoryIdOrName: string, categoryMap: Record<string, string>) {
  if (!categoryIdOrName) {
    return UNCATEGORIZED_LABEL
  }

  return categoryMap[categoryIdOrName] ?? categoryIdOrName
}

function sortCategoryTotals(categoryTotals: Record<string, number>) {
  return Object.entries(categoryTotals)
    .map(([name, total]) => ({ name, total }))
    .sort((firstCategory, secondCategory) => secondCategory.total - firstCategory.total)
}

export function getAnnualPresentationSummary(
  movements: CashFlowWithMovements[],
  categories: Category[]
): AnnualPresentationSummary {
  const categoryMap = categories.reduce<Record<string, string>>((accumulator, category) => {
    accumulator[category.id] = category.name
    return accumulator
  }, {})

  const revenueTotals: Record<string, number> = {}
  const expenseTotals: Record<string, number> = {}
  let totalRevenue = 0
  let totalExpense = 0

  movements.forEach((movement) => {
    movement.inflows.forEach((inflow) => {
      const categoryName = resolveCategoryName(inflow.category, categoryMap)
      const value = Number(inflow.inflow_value) || 0

      revenueTotals[categoryName] = (revenueTotals[categoryName] || 0) + value
      totalRevenue += value
    })

    const redemptionValue = Number(movement.redemption_application) || 0
    if (redemptionValue > 0) {
      revenueTotals[REDEMPTION_LABEL] = (revenueTotals[REDEMPTION_LABEL] || 0) + redemptionValue
      totalRevenue += redemptionValue
    }

    movement.outflows.forEach((outflow) => {
      const categoryName = resolveCategoryName(outflow.category, categoryMap)
      const value = Number(outflow.outflow_value) || 0

      expenseTotals[categoryName] = (expenseTotals[categoryName] || 0) + value
      totalExpense += value
    })
  })

  return {
    revenueCategories: sortCategoryTotals(revenueTotals),
    expenseCategories: sortCategoryTotals(expenseTotals),
    totalRevenue,
    totalExpense,
  }
}
