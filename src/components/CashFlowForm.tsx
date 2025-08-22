import { useState } from 'react'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from './CurrencyInput'
import { SearchableSelect } from './SearchableSelect'

interface CashFlowFormProps {
  title: string
  icon: React.ReactNode
  types: string[]
  onSubmit: (data: any) => void
  schema: z.ZodSchema
}

export function CashFlowForm({ title, icon, types, onSubmit, schema }: CashFlowFormProps) {
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [amount, setAmount] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Converter valor monetário para número
    const numericAmount = parseFloat(
      amount.replace(/[^\d,]/g, '').replace(',', '.')
    )
    
    const formData = {
      description: description.trim(),
      type,
      amount: numericAmount
    }
    
    try {
      const validatedData = schema.parse(formData)
      onSubmit(validatedData)
      
      // Limpar formulário
      setDescription('')
      setType('')
      setAmount('')
      setErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
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
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Digite a descrição..."
            className={cn(
              "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-400",
              errors.description && "border-red-500"
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
            onChange={setType}
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
            onChange={setAmount}
            placeholder="R$ 0,00"
            error={errors.amount}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full text-zinc-700 bg-zinc-200 hover:bg-zinc-100"
        >
          Adicionar
        </Button>
      </form>
    </div>
  )
}