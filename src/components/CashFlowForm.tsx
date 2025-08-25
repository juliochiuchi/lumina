import { useState, useRef } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
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
  titleNotification: string
}

export function CashFlowForm({ title, titleNotification, icon, types, onSubmit, schema }: CashFlowFormProps) {
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [amount, setAmount] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Ref para o campo de descrição
  const descriptionInputRef = useRef<HTMLInputElement>(null)

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
      
      // Notificação de sucesso
      toast.success(`${titleNotification} adicionada com sucesso!`, {
        description: `${description} - ${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(numericAmount)}`,
        duration: 3000,
      })
      
      // Limpar formulário
      setDescription('')
      setType('')
      setAmount('')
      setErrors({})
      
      // Focar no campo descrição após adicionar com sucesso
      setTimeout(() => {
        descriptionInputRef.current?.focus()
      }, 0)
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
        
        // Notificação de erro
        toast.error('Erro ao adicionar entrada', {
          description: errorMessages.join(', '),
          duration: 4000,
        })
      } else {
        // Erro genérico
        toast.error('Erro inesperado', {
          description: 'Ocorreu um erro ao processar a solicitação.',
          duration: 4000,
        })
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
            ref={descriptionInputRef}
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