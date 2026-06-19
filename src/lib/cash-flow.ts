import { z } from 'zod'

const amountSchema = z.preprocess(
  (value) => (typeof value === 'number' && !Number.isNaN(value) ? value : undefined),
  z
    .number({ error: 'Valor é obrigatório.' })
    .positive('O valor deve ser maior que zero.')
)

export const cashFlowFormSchema = z.object({
  description: z.string().trim().min(1, 'Descrição é obrigatória').max(100, 'Descrição muito longa'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  amount: amountSchema,
})

export const entrySchema = cashFlowFormSchema
export const exitSchema = cashFlowFormSchema

export function formatCurrencyInputValue(amount: number) {
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function parseCurrencyInput(value: string) {
  const sanitizedValue = value.replace(/[^\d,]/g, '').replace(',', '.')

  if (!sanitizedValue) {
    return undefined
  }

  const numericValue = Number(sanitizedValue)

  return Number.isNaN(numericValue) ? undefined : numericValue
}
