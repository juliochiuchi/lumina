import { supabase } from '@/utils/supabase'

export type Category = {
  id: string
  name: string
  created_at: string
}

export const categoriesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    return data as Category[]
  }
}
