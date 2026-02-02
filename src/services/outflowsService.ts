import { supabase } from '@/utils/supabase'

export type Outflow = {
  id: string
  cash_flow: string
  category: string
  description: string
  outflow_value: number
  created_at?: string
}

export const outflowsService = {
  async listByCashFlow(cashFlowId: string) {
    const { data, error } = await supabase
      .from('outflows')
      .select('*')
      .eq('cash_flow', cashFlowId)
      .order('id', { ascending: true })

    if (error) {
      throw error
    }

    return data as Outflow[]
  },

  async create(payload: Omit<Outflow, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('outflows')
      .insert(payload)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Outflow
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('outflows')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }
}
