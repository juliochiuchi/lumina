import { supabase } from '@/utils/supabase'

export type CashFlow = {
  id: string
  name: string
  initial_balance: number
  final_balance: number
  investment_application: number
  redemption_application: number
  regard_month: string
  year: string
}

export const cashFlowService = {
  async getByYear(year: string) {
    const { data, error } = await supabase
      .from('cash_flows')
      .select('*')
      .eq('year', year)

    if (error) {
      throw error
    }

    return data as CashFlow[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('cash_flows')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return data as CashFlow
  },

  async create(cashFlow: Omit<CashFlow, 'id'>) {
    const { data, error } = await supabase
      .from('cash_flows')
      .insert(cashFlow)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as CashFlow
  },

  async update(id: string, cashFlow: Partial<CashFlow>) {
    const { data, error } = await supabase
      .from('cash_flows')
      .update(cashFlow)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as CashFlow
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('cash_flows')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }
}
