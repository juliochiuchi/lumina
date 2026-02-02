import { supabase } from '@/utils/supabase'

export type Inflow = {
  id: string
  cash_flow: string
  category: string
  description: string
  inflow_value: number
  created_at?: string
}

export const inflowsService = {
  async listByCashFlow(cashFlowId: string) {
    const { data, error } = await supabase
      .from('inflows')
      .select('*')
      .eq('cash_flow', cashFlowId)
      .order('id', { ascending: true })

    if (error) {
      throw error
    }

    return data as Inflow[]
  },

  async create(payload: Omit<Inflow, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('inflows')
      .insert(payload)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Inflow
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('inflows')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }
}
