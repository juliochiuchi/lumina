import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { CalendarRange, Plus } from "lucide-react"
import { toast } from "sonner"

import { AccessRestrictedCard } from "@/components/AccessRestrictedCard"
import {
  OpeningContributionCard,
} from "@/components/opening-contributions/OpeningContributionCard"
import {
  OpeningContributionFormModal,
  type OpeningContributionFormPayload,
} from "@/components/opening-contributions/OpeningContributionFormModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { GlobalLoading } from "@/components/ui/global-loading"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/use-auth"
import {
  compareContributionMonths,
  normalizeOpeningContributionMonth,
  normalizeOpeningContributionYear,
} from "@/lib/opening-contributions"
import {
  openingContributionsService,
  type OpeningContribution,
  type OpeningContributionWithTotal,
} from "@/services/openingContributionsService"

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message
  }

  return null
}

function sortYearsDescending(years: string[]) {
  return [...years].sort((left, right) => Number(right) - Number(left))
}

function buildFormYearOptions(availableYears: string[], extraYears: string[] = []) {
  const currentYear = new Date().getFullYear()
  const generatedYears = Array.from({ length: 7 }, (_, index) => String(currentYear + 2 - index))

  return sortYearsDescending(Array.from(new Set([...availableYears, ...extraYears, ...generatedYears])))
}

function sortOpeningsByMonth(openings: OpeningContributionWithTotal[]) {
  return [...openings].sort((left, right) => compareContributionMonths(left.month, right.month))
}

function normalizeOpeningContributionForForm(openingContribution: OpeningContribution): OpeningContribution {
  return {
    ...openingContribution,
    year: normalizeOpeningContributionYear(openingContribution.year),
    month: normalizeOpeningContributionMonth(openingContribution.month),
  }
}

export const Route = createFileRoute("/_app/opening_contributions")({
  component: OpeningContributionsPage,
})

function OpeningContributionsPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const currentYear = new Date().getFullYear().toString()

  const [openingContributions, setOpeningContributions] = useState<OpeningContributionWithTotal[]>([])
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [loading, setLoading] = useState(false)
  const [isPreparingModal, setIsPreparingModal] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOpeningContribution, setSelectedOpeningContribution] = useState<OpeningContribution | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openingToDelete, setOpeningToDelete] = useState<OpeningContributionWithTotal | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const formYearOptions = useMemo(
    () =>
      buildFormYearOptions(
        availableYears,
        [selectedYear, selectedOpeningContribution?.year ?? ""].filter(Boolean),
      ),
    [availableYears, selectedOpeningContribution?.year, selectedYear],
  )

  useEffect(() => {
    if (!isAdmin) return

    const fetchAvailableYears = async () => {
      try {
        const years = await openingContributionsService.getAvailableYears()
        setAvailableYears(years)

        setSelectedYear((currentSelectedYear) => {
          if (years.length === 0) {
            return currentSelectedYear || currentYear
          }

          if (years.includes(currentSelectedYear)) {
            return currentSelectedYear
          }

          return years[0]
        })
      } catch (error) {
        console.error(error)
        toast.error(getErrorMessage(error) ?? "Não foi possível carregar os anos disponíveis")
      }
    }

    void fetchAvailableYears()
  }, [currentYear, isAdmin])

  useEffect(() => {
    if (!isAdmin || !selectedYear) return

    const fetchOpenings = async () => {
      setLoading(true)

      try {
        const data = await openingContributionsService.getByYear(selectedYear)
        setOpeningContributions(data)
      } catch (error) {
        console.error(error)
        toast.error(getErrorMessage(error) ?? "Não foi possível carregar as aberturas de contribuições")
      } finally {
        setLoading(false)
      }
    }

    void fetchOpenings()
  }, [isAdmin, selectedYear])

  const handleOpenCreateModal = () => {
    setSelectedOpeningContribution(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (openingContribution: OpeningContributionWithTotal) => {
    setIsPreparingModal(true)

    try {
      const openingContributionToEdit = await openingContributionsService.getById(openingContribution.id)
      setSelectedOpeningContribution(normalizeOpeningContributionForForm(openingContributionToEdit))
      setIsModalOpen(true)
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error) ?? "Não foi possível carregar a abertura para edição")
    } finally {
      setIsPreparingModal(false)
    }
  }

  const handleCloseModal = () => {
    if (isSubmitting) return
    setIsModalOpen(false)
    setSelectedOpeningContribution(null)
  }

  const handleSubmitOpeningContribution = async (payload: OpeningContributionFormPayload) => {
    setIsSubmitting(true)

    try {
      if (selectedOpeningContribution) {
        const updatedOpening = await openingContributionsService.update(selectedOpeningContribution.id, payload)
        const updatedWithTotal = await openingContributionsService.getById(updatedOpening.id)

        setOpeningContributions((current) => {
          const filteredCurrent = current.filter((item) => item.id !== updatedWithTotal.id)

          if (updatedWithTotal.year !== selectedYear) {
            return filteredCurrent
          }

          return sortOpeningsByMonth([...filteredCurrent, updatedWithTotal])
        })

        setAvailableYears((current) => sortYearsDescending(Array.from(new Set([...current, updatedWithTotal.year]))))
        toast.success("Abertura atualizada com sucesso")
      } else {
        const newOpening = await openingContributionsService.create(payload)
        const newOpeningWithTotal = await openingContributionsService.getById(newOpening.id)

        setOpeningContributions((current) =>
          newOpeningWithTotal.year === selectedYear
            ? sortOpeningsByMonth([...current, newOpeningWithTotal])
            : current
        )
        setAvailableYears((current) => sortYearsDescending(Array.from(new Set([...current, newOpeningWithTotal.year]))))
        setSelectedYear(newOpeningWithTotal.year)
        toast.success("Abertura cadastrada com sucesso")
      }

      setIsModalOpen(false)
      setSelectedOpeningContribution(null)
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error) ?? "Não foi possível salvar a abertura")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteOpeningContribution = async () => {
    if (!openingToDelete) return

    setIsDeleting(true)

    try {
      await openingContributionsService.delete(openingToDelete.id)
      const nextOpenings = openingContributions.filter((item) => item.id !== openingToDelete.id)
      setOpeningContributions(nextOpenings)

      if (nextOpenings.length === 0) {
        const refreshedYears = availableYears.filter((year) => year !== openingToDelete.year)
        setAvailableYears(refreshedYears)

        if (selectedYear === openingToDelete.year && refreshedYears.length > 0) {
          setSelectedYear(refreshedYears[0])
        }
      }

      setOpeningToDelete(null)
      toast.success("Abertura excluída com sucesso")
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error) ?? "Não foi possível excluir a abertura")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAdmin) {
    return (
      <AccessRestrictedCard description="Apenas usuários com permissão administrativa podem acessar a área de contribuições." />
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 text-foreground sm:p-6">
      <GlobalLoading
        visible={loading || isPreparingModal}
        text={isPreparingModal ? "Carregando dados da abertura..." : "Carregando aberturas de contribuições..."}
      />

      <OpeningContributionFormModal
        key={selectedOpeningContribution ? `edit-${selectedOpeningContribution.id}` : "create-opening-contribution"}
        isOpen={isModalOpen}
        openingContribution={selectedOpeningContribution}
        yearOptions={formYearOptions}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={handleSubmitOpeningContribution}
      />

      <ConfirmationModal
        isOpen={openingToDelete !== null}
        onClose={() => {
          if (!isDeleting) setOpeningToDelete(null)
        }}
        onConfirm={handleDeleteOpeningContribution}
        title="Excluir abertura"
        description={
          openingToDelete
            ? `Tem certeza que deseja excluir a abertura de ${openingToDelete.month}/${openingToDelete.year}?`
            : "Tem certeza que deseja excluir esta abertura?"
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />

      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Abertura de Contribuições</h1>
                <p className="text-sm text-muted-foreground">
                  Organize as aberturas mensais e acompanhe o total arrecadado de cada período.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Cadastrar nova abertura
          </Button>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <div className="space-y-3">
              <div>
                <CardTitle className="text-xl text-foreground">Filtros</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecione o ano para visualizar as aberturas cadastradas.
                </p>
              </div>

              <div className="w-full max-w-xs space-y-2">
                <Label htmlFor="opening-contribution-filter-year" className="text-foreground">
                  Ano
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="opening-contribution-filter-year" className="bg-input text-foreground">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortYearsDescending(Array.from(new Set([...availableYears, selectedYear]))).map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {openingContributions.length === 0 ? (
          <Card className="border-dashed border-border bg-card/70">
            <CardContent className="flex min-h-52 flex-col items-center justify-center space-y-3 p-8 text-center">
              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Nenhuma abertura encontrada</h2>
                <p className="text-sm text-muted-foreground">
                  Não há aberturas de contribuições cadastradas para o ano selecionado.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {openingContributions.length > 0 ? (
          <div className="pt-2 flex flex-wrap gap-4 justify-center lg:justify-start">
            {openingContributions.map((openingContribution) => (
              <OpeningContributionCard
                key={openingContribution.id}
                openingContribution={openingContribution}
                onView={(selected) =>
                  navigate({
                    to: "/contributions/$openingContributionId",
                    params: { openingContributionId: selected.id },
                  })
                }
                onEdit={handleOpenEditModal}
                onDelete={setOpeningToDelete}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
