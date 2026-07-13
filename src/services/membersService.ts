import { supabase } from "@/utils/supabase"
import { sanitizeCpf } from "@/lib/cpf"

export type Member = {
  id: string
  name: string
  cpf: string | null
}

type MemberPayload = {
  name: string
  cpf?: string | null
}

const normalizePayload = (payload: MemberPayload) => ({
  name: payload.name.trim(),
  cpf: payload.cpf ? sanitizeCpf(payload.cpf) : null,
})

export const membersService = {
  async getAll() {
    const { data, error } = await supabase
      .from("members")
      .select("id, name, cpf")
      .order("name", { ascending: true })

    if (error) {
      throw error
    }

    return (data ?? []) as Member[]
  },

  async create(payload: MemberPayload) {
    const { data, error } = await supabase
      .from("members")
      .insert(normalizePayload(payload))
      .select("id, name, cpf")
      .single()

    if (error) {
      throw error
    }

    return data as Member
  },

  async update(id: string, payload: MemberPayload) {
    const { data, error } = await supabase
      .from("members")
      .update(normalizePayload(payload))
      .eq("id", id)
      .select("id, name, cpf")
      .single()

    if (error) {
      throw error
    }

    return data as Member
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", id)

    if (error) {
      throw error
    }
  },
}
