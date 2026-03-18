import { GlobalLoading } from '@/components/ui/global-loading'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/receipts')({
  component: RouteComponent,
})

function RouteComponent() {
  const [loading] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <GlobalLoading visible={loading} text="Carregando dados..." />

      <div className="mb-6 sm:mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Home
        </Link>
      </div>

      <div className="container mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white text-center lg:text-left">
            Recibos
          </h1>
          <p className="text-zinc-400 text-center lg:text-left">
            Visualize e gerencie recibos.
          </p>
        </div>
      </div>
    </div>
  )
}
