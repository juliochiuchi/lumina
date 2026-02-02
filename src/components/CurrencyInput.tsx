import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface CurrencyInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

export function CurrencyInput({ value, onChange, placeholder, error }: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value

    // Remove tudo que não é dígito
    inputValue = inputValue.replace(/\D/g, '')

    // Converte para número e formata como moeda
    const numericValue = parseInt(inputValue) || 0
    const formattedValue = (numericValue / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    onChange(formattedValue)
  }

  return (
    <div className="space-y-1">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "bg-input border-border text-foreground placeholder-muted-foreground",
          error && "border-destructive"
        )}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}