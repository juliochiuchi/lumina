import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from './CurrencyInput'

interface BalanceInputProps {
  label: string
  value: string
  onSave: (value: number) => void
}

export function BalanceInput({ label, value, onSave }: BalanceInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    const numericValue = parseFloat(
      inputValue.replace(/[^\d,]/g, '').replace(',', '.')
    )

    if (!isNaN(numericValue)) {
      onSave(numericValue)
      setIsEditing(false)
      setInputValue('')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setInputValue('')
  }

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-300">{label}</h3>
          <p className="text-lg font-bold text-zinc-100">{value}</p>
        </div>

        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-zinc-400"
          >
            Clique aqui para editar
          </Button>
        ) : (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <CurrencyInput
              value={inputValue}
              onChange={setInputValue}
              placeholder="R$ 0,00"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
              >
                Salvar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="bg-zinc-600 hover:bg-zinc-500 border-zinc-500 text-zinc-100"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}