import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cashFlowService, type CashFlow } from '@/services/cashFlowService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose, DrawerDescription } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/CurrencyInput'
import { toast } from 'sonner'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

export const Route = createFileRoute('/_app/')({
  component: Index,
})

// Schema for validation
const filterSchema = z.object({
  year: z.string().min(4, "Selecione um ano"),
})

const createMovementSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(250, "Nome deve ter no máximo 250 caracteres"),
  initial_balance: z.string().min(1, "Saldo inicial é obrigatório"),
  final_balance: z.string().min(1, "Saldo final é obrigatório"),
  investment_application: z.string().min(1, "Aplicação investimento é obrigatório"),
  redemption_application: z.string().min(1, "Resgate aplicação é obrigatório"),
  regard_month: z.string().min(1, "Mês é obrigatório"),
  year: z.string()
})

type FilterFormValues = z.infer<typeof filterSchema>
type CreateMovementFormValues = z.infer<typeof createMovementSchema>

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

function Index() {
  const navigate = useNavigate()
  const [movements, setMovements] = useState<CashFlow[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [years, setYears] = useState<string[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [movementToDelete, setMovementToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
    },
  })

  const createForm = useForm<CreateMovementFormValues>({
    resolver: zodResolver(createMovementSchema),
    defaultValues: {
      name: '',
      initial_balance: 'R$ 0,00',
      final_balance: 'R$ 0,00',
      investment_application: 'R$ 0,00',
      redemption_application: 'R$ 0,00',
      regard_month: '',
      year: new Date().getFullYear().toString()
    }
  })

  // Generate a list of years for the dropdown (e.g., last 5 years + next year)
  useEffect(() => {
    const currentYear = new Date().getFullYear()
    const yearList = Array.from({ length: 6 }, (_, i) => (currentYear - 4 + i).toString()).reverse()
    setYears(yearList)
  }, [])

  const fetchMovements = async (data: FilterFormValues) => {
    setLoading(true)
    try {
      const result = await cashFlowService.getByYear(data.year)
      setMovements(result || [])
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch initial data on mount with default year
  useEffect(() => {
    fetchMovements(form.getValues())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (data: FilterFormValues) => {
    fetchMovements(data)
  }

  const onCreateSubmit = async (data: CreateMovementFormValues) => {
    setIsSubmitting(true)
    try {
      // Parse currency values
      // CurrencyInput returns formatted string like "R$ 0,00"
      // We need to parse it back to number

      const parse = (val: string) => {
        const digits = val.replace(/\D/g, '')
        return parseInt(digits) / 100
      }

      const newMovement = await cashFlowService.create({
        name: data.name,
        initial_balance: parse(data.initial_balance),
        final_balance: parse(data.final_balance),
        investment_application: parse(data.investment_application),
        redemption_application: parse(data.redemption_application),
        regard_month: data.regard_month,
        year: data.year
      })

      toast.success("Movimento criado com sucesso!")
      setIsDrawerOpen(false)
      createForm.reset()

      // Navigate to cash_flow page with the new ID
      navigate({
        to: '/cash_flow',
        search: { id: newMovement.id }
      })

    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar movimento")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!movementToDelete) return

    setIsDeleting(true)
    try {
      await cashFlowService.delete(movementToDelete)
      setMovements(prev => prev.filter(m => m.id !== movementToDelete))
      toast.success("Movimento excluído com sucesso!")
      setDeleteModalOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir movimento")
    } finally {
      setIsDeleting(false)
      setMovementToDelete(null)
    }
  }

  const handleDeleteClick = (id: string) => {
    setMovementToDelete(id)
    setDeleteModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Movimento"
        description="Tem certeza que deseja excluir este movimento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-end md:justify-between md:space-y-0">
          <h1 className="text-3xl font-bold tracking-tight text-white">Movimentos de Caixa</h1>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <Drawer direction="top" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Novo Movimento
                </Button>
              </DrawerTrigger>
              <DrawerContent className="top-0 mt-0 mb-auto rounded-b-[10px] rounded-t-none bottom-auto bg-card border-border text-card-foreground">
                <div className="mx-auto w-full max-w-4xl">
                  <DrawerHeader>
                    <DrawerTitle className="text-zinc-50">Novo Movimento de Caixa</DrawerTitle>
                    <DrawerDescription className="text-zinc-400">
                      Informe os dados iniciais para a abertura de um novo movimento. Você será redirecionado após concluir e salvar esta etapa.
                    </DrawerDescription>
                  </DrawerHeader>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" {...createForm.register("name")} className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
                        {createForm.formState.errors.name && <p className="text-destructive text-sm">{createForm.formState.errors.name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Ano</Label>
                        <Input {...createForm.register("year")} disabled className="bg-muted border-border text-muted-foreground cursor-not-allowed opacity-50" />
                      </div>

                      <div className="space-y-2">
                        <Label>Mês Referência</Label>
                        <Controller
                          control={createForm.control}
                          name="regard_month"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="bg-input border-border">
                                <SelectValue placeholder="Selecione o mês" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border text-popover-foreground">
                                {MONTHS.map(month => (
                                  <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {createForm.formState.errors.regard_month && <p className="text-red-400 text-sm">{createForm.formState.errors.regard_month.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Saldo Inicial</Label>
                        <Controller
                          control={createForm.control}
                          name="initial_balance"
                          render={({ field }) => (
                            <CurrencyInput
                              value={field.value}
                              onChange={field.onChange}
                              error={createForm.formState.errors.initial_balance?.message}
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Saldo Final</Label>
                        <Controller
                          control={createForm.control}
                          name="final_balance"
                          render={({ field }) => (
                            <CurrencyInput
                              value={field.value}
                              onChange={field.onChange}
                              error={createForm.formState.errors.final_balance?.message}
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Aplicação Investimento</Label>
                        <Controller
                          control={createForm.control}
                          name="investment_application"
                          render={({ field }) => (
                            <CurrencyInput
                              value={field.value}
                              onChange={field.onChange}
                              error={createForm.formState.errors.investment_application?.message}
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Resgate Aplicação</Label>
                        <Controller
                          control={createForm.control}
                          name="redemption_application"
                          render={({ field }) => (
                            <CurrencyInput
                              value={field.value}
                              onChange={field.onChange}
                              error={createForm.formState.errors.redemption_application?.message}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <DrawerFooter className="flex flex-col gap-2 pt-4 w-full">
                      <Button type="submit" disabled={isSubmitting} className="w-full bg-zinc-50 hover:bg-zinc-200 text-zinc-950">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar'}
                      </Button>
                      <DrawerClose asChild>
                        <Button variant="outline" type="button" className="w-full bg-transparent border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100">Cancelar</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </form>
                </div>
              </DrawerContent>
            </Drawer>

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full max-w-sm items-end space-x-4">
              <div className="w-full space-y-2">
                <Label htmlFor="year" className="text-zinc-200">Filtrar por Ano</Label>
                <Controller
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="year" className="w-full bg-zinc-900 border-zinc-800 text-zinc-100">
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        {years.map((year) => (
                          <SelectItem key={year} value={year} className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Filtrar'}
              </Button>
            </form>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {movements.length > 0 ? (
            movements.map((movement) => (
              <Card key={movement.id} className="w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.7rem)] xl:w-[calc(25%-0.8rem)] bg-card border-border text-card-foreground hover:bg-accent/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {movement.regard_month}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDeleteClick(movement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold truncate" title={movement.name}>{movement.name}</div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Ano: {movement.year}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            !loading && (
              <div className="w-full flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-800 text-zinc-500">
                Nenhum movimento encontrado para este ano.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
