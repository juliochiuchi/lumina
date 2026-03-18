import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from "@/contexts/use-auth"

export function AccessModal() {
  const { login } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (login(code)) {
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Acesso Restrito
          </h2>
          <p className="text-sm text-muted-foreground">
            Por favor, insira o código de validação para acessar esta página.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="access-code">Código de Acesso</Label>
            <Input
              id="access-code"
              type="password"
              placeholder="Digite o código..."
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(false)
              }}
              className={error ? 'border-red-500' : ''}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">Código incorreto, tente novamente.</p>}
          </div>
          <div className="flex justify-end">
            <Button type="submit">Confirmar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
