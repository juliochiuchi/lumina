import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrencyInputValue, parseCurrencyInput } from '@/lib/cash-flow'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from './CurrencyInput'
import { SearchableSelect } from './SearchableSelect'
import type { CashFlowFormData, CashFlowFormMode } from '@/types/cash-flow'

interface CashFlowFormProps<TSchema extends z.ZodTypeAny> {
  title: string
  icon: React.ReactNode
  types: string[]
  onSubmit: (data: z.infer<TSchema>) => Promise<boolean> | boolean
  schema: TSchema
  mode?: CashFlowFormMode
  initialData?: CashFlowFormData | null
  onCancelEdit?: () => void
}

const EMPTY_FORM_VALUES = {
  description: '',
  type: '',
  amount: '',
}

export function CashFlowForm<TSchema extends z.ZodTypeAny>({
  title,
  icon,
  types,
  onSubmit,
  schema,
  mode = 'create',
  initialData = null,
  onCancelEdit,
}: CashFlowFormProps<TSchema>) {
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [amount, setAmount] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const descriptionInputRef = useRef<HTMLInputElement>(null)

  const isEditing = mode === 'edit'

  const resetForm = () => {
    setDescription(EMPTY_FORM_VALUES.description)
    setType(EMPTY_FORM_VALUES.type)
    setAmount(EMPTY_FORM_VALUES.amount)
    setErrors({})
  }

  useEffect(() => {
    if (isEditing && initialData) {
      setDescription(initialData.description)
      setType(initialData.type)
      setAmount(formatCurrencyInputValue(initialData.amount))
      setErrors({})
    } else {
      resetForm()
    }

    descriptionInputRef.current?.focus()
  }, [initialData, isEditing])

  const clearFieldError = (field: keyof CashFlowFormData) => {
    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors
      }

      const updatedErrors = { ...currentErrors }
      delete updatedErrors[field]

      return updatedErrors
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = {
      description: description.trim(),
      type,
      amount: parseCurrencyInput(amount),
    }

    try {
      const validatedData = schema.parse(formData)
      const shouldReset = await onSubmit(validatedData)

      if (shouldReset) {
        resetForm()

        setTimeout(() => {
          descriptionInputRef.current?.focus()
        }, 0)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        const errorMessages: string[] = []

        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
            errorMessages.push(err.message)
          }
        })

        setErrors(newErrors)

        toast.error('Não foi possível salvar o registro', {
          description: errorMessages.join(', '),
          duration: 4000,
        })
      } else {
        toast.error('Erro inesperado', {
          description: 'Ocorreu um erro ao processar a solicitação.',
          duration: 4000,
        })
      }
    }
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Descrição
          </label>
          <Input
            ref={descriptionInputRef}
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              clearFieldError('description')
            }}
            placeholder="Digite a descrição..."
            className={cn(
              "bg-input border-border text-foreground placeholder-muted-foreground",
              errors.description && "border-destructive"
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-400 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Categoria
          </label>
          <SearchableSelect
            options={types}
            value={type}
            onChange={(selectedType) => {
              setType(selectedType)
              clearFieldError('type')
            }}
            placeholder="Selecione uma categoria..."
            error={errors.type}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Valor
          </label>
          <CurrencyInput
            value={amount}
            onChange={(value) => {
              setAmount(value)
              clearFieldError('amount')
            }}
            placeholder="R$ 0,00"
            error={errors.amount}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            className="flex-1 text-zinc-700 bg-zinc-200 hover:bg-zinc-100"
          >
            {isEditing ? 'Salvar alterações' : 'Adicionar'}
          </Button>

          {isEditing ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onCancelEdit?.()
              }}
              className="flex-1 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            >
              Cancelar edição
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
