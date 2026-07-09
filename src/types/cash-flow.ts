export type CashFlowFormMode = 'create' | 'edit'

export interface CashFlowFormData {
  description: string
  type: string
  amount: number
}

export interface CashFlowRecord extends CashFlowFormData {
  id: string
  date: string
  createdAt?: string
}
