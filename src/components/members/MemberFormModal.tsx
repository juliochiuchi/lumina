import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useEffect } from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCpf, sanitizeCpf } from "@/lib/cpf"
import type { Member } from "@/services/membersService"

const memberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(120, "Nome deve ter no máximo 120 caracteres"),
  cpf: z
    .string()
    .refine((value) => {
      const digits = sanitizeCpf(value)
      return digits.length === 0 || digits.length === 11
    }, "Se informado, o CPF deve conter 11 dígitos"),
})

type MemberFormValues = z.input<typeof memberSchema>

export type MemberFormPayload = {
  name: string
  cpf: string | null
}

interface MemberFormModalProps {
  isOpen: boolean
  member: Member | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: MemberFormPayload) => Promise<void>
}

export function MemberFormModal({
  isOpen,
  member,
  isSubmitting = false,
  onClose,
  onSubmit,
}: MemberFormModalProps) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      cpf: "",
    },
  })

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: "",
        cpf: "",
      })
      return
    }

    form.reset({
      name: member?.name ?? "",
      cpf: member?.cpf ? formatCpf(member.cpf) : "",
    })
  }, [form, isOpen, member])

  if (!isOpen) return null

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      cpf: sanitizeCpf(values.cpf) || null,
    })
  })

  const title = member ? "Editar contribuinte" : "Novo contribuinte"
  const description = member
    ? "Atualize os dados do contribuinte selecionado."
    : "Preencha os dados para cadastrar um novo contribuinte."

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={() => {
        if (!isSubmitting) onClose()
      }}
      role="presentation"
    >
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-form-title"
        aria-describedby="member-form-description"
      >
        <div className="space-y-2">
          <h2 id="member-form-title" className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p id="member-form-description" className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">Nome</Label>
            <Input
              id="member-name"
              {...form.register("name")}
              placeholder="Nome completo do contribuinte"
              className="bg-input"
              disabled={isSubmitting}
            />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-cpf">CPF (opcional)</Label>
            <Controller
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <Input
                  id="member-cpf"
                  value={field.value}
                  onChange={(event) => field.onChange(formatCpf(event.target.value))}
                  placeholder="000.000.000-00"
                  className="bg-input"
                  disabled={isSubmitting}
                />
              )}
            />
            {form.formState.errors.cpf ? (
              <p className="text-sm text-destructive">{form.formState.errors.cpf.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : member ? "Salvar alterações" : "Cadastrar contribuinte"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
