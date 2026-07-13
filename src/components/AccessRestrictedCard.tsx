import { useNavigate } from "@tanstack/react-router"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AccessRestrictedCardProps {
  description: string
}

export function AccessRestrictedCard({ description }: AccessRestrictedCardProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background p-4 text-foreground sm:p-8">
      <div className="container mx-auto flex max-w-3xl items-center justify-center">
        <Card className="w-full border-border bg-card">
          <CardHeader className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl text-foreground">Acesso restrito</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => navigate({ to: "/" })}
            >
              Voltar ao painel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
