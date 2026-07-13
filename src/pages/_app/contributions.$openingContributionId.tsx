import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Award, CalendarDays, Coins, Gift, Search, Wallet } from "lucide-react"
import { toast } from "sonner"

import { AccessRestrictedCard } from "@/components/AccessRestrictedCard"
import { ContributionsEditableTable } from "@/components/contributions/ContributionsEditableTable"
import { OfferDetailsModal } from "@/components/contributions/OfferDetailsModal"
import { OfferFormModal } from "@/components/contributions/OfferFormModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlobalLoading } from "@/components/ui/global-loading"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/use-auth"
import { formatContributionCurrency } from "@/lib/contributions"
import type { ContributionSunday } from "@/lib/opening-contributions"
import { monthlyContributionsService, type MonthlyContributionSheet } from "@/services/monthlyContributionsService"

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message
  }

  return null
}

function sumValues(values: Array<number | null | undefined>) {
  return Math.round(
    values.reduce<number>((sum, value) => sum + Number(value ?? 0), 0) * 100,
  ) / 100
}

function buildCellKey(memberId: string, dateSunday: string) {
  return `${memberId}:${dateSunday}`
}

function hasPreviewValue(previewValues: Record<string, number | null>, cellKey: string) {
  return Object.prototype.hasOwnProperty.call(previewValues, cellKey)
}

function getVisibleMemberValue(
  previewValues: Record<string, number | null>,
  cellKey: string,
  persistedValue: number | null,
) {
  return hasPreviewValue(previewValues, cellKey) ? previewValues[cellKey] : persistedValue
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

export const Route = createFileRoute("/_app/contributions/$openingContributionId")({
  component: ContributionsPage,
})

function ContributionsPage() {
  const navigate = useNavigate()
  const { openingContributionId } = Route.useParams()
  const { isAdmin } = useAuth()

  const [sheet, setSheet] = useState<MonthlyContributionSheet | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewValues, setPreviewValues] = useState<Record<string, number | null>>({})
  const [savingCellKeys, setSavingCellKeys] = useState<Set<string>>(new Set())
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [isOfferSubmitting, setIsOfferSubmitting] = useState(false)
  const [selectedOfferDetailsDate, setSelectedOfferDetailsDate] = useState<string | null>(null)
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isAdmin) {
      return
    }

    const fetchSheet = async () => {
      setLoading(true)

      try {
        const data = await monthlyContributionsService.getSheet(openingContributionId)
        setSheet(data)
        setPreviewValues({})
      } catch (error) {
        console.error(error)
        toast.error(getErrorMessage(error) ?? "Não foi possível carregar as contribuições do mês")
      } finally {
        setLoading(false)
      }
    }

    void fetchSheet()
  }, [isAdmin, openingContributionId])

  const summary = useMemo(() => {
    if (!sheet) {
      return {
        sundayCount: 0,
        totalTithes: 0,
        totalOffers: 0,
        grandTotal: 0,
      }
    }

    const totalTithes = sumValues(
      sheet.rows.flatMap((row) =>
        sheet.sundays.map((sunday) =>
          getVisibleMemberValue(
            previewValues,
            buildCellKey(row.memberId, sunday.date),
            row.valuesBySunday[sunday.date] ?? null,
          ),
        ),
      ),
    )

    const totalOffers = sumValues(
      Object.values(sheet.offersBySunday).flatMap((entries) => entries.map((entry) => entry.amount)),
    )

    return {
      sundayCount: sheet.sundays.length,
      totalTithes,
      totalOffers,
      grandTotal: totalTithes + totalOffers,
    }
  }, [previewValues, sheet])

  const selectedOfferSunday: ContributionSunday | null = useMemo(() => {
    if (!sheet || !selectedOfferDetailsDate) {
      return null
    }

    return sheet.sundays.find((sunday) => sunday.date === selectedOfferDetailsDate) ?? null
  }, [selectedOfferDetailsDate, sheet])

  const selectedOfferEntries = useMemo(() => {
    if (!sheet || !selectedOfferDetailsDate) {
      return []
    }

    return sheet.offersBySunday[selectedOfferDetailsDate] ?? []
  }, [selectedOfferDetailsDate, sheet])

  const filteredRows = useMemo(() => {
    if (!sheet) {
      return []
    }

    const normalizedSearchTerm = normalizeSearchValue(searchTerm)

    if (!normalizedSearchTerm) {
      return sheet.rows
    }

    return sheet.rows.filter((row) => normalizeSearchValue(row.memberName).includes(normalizedSearchTerm))
  }, [searchTerm, sheet])

  const topContributors = useMemo(() => {
    if (!sheet) {
      return []
    }

    return sheet.rows
      .map((row) => ({
        memberId: row.memberId,
        memberName: row.memberName,
        total: sumValues(
          sheet.sundays.map((sunday) =>
            getVisibleMemberValue(
              previewValues,
              buildCellKey(row.memberId, sunday.date),
              row.valuesBySunday[sunday.date] ?? null,
            ),
          ),
        ),
      }))
      .filter((row) => row.total > 0)
      .sort((left, right) => right.total - left.total || left.memberName.localeCompare(right.memberName, "pt-BR"))
      .slice(0, 3)
  }, [previewValues, sheet])

  const handlePreviewChange = (cellKey: string, value?: number | null) => {
    setPreviewValues((current) => {
      const next = { ...current }

      if (value === undefined) {
        delete next[cellKey]
        return next
      }

      next[cellKey] = value
      return next
    })
  }

  const handleCommitMemberValue = async (memberId: string, dateSunday: string, amount: number | null) => {
    if (!sheet) {
      return false
    }

    const cellKey = buildCellKey(memberId, dateSunday)
    const memberRow = sheet.rows.find((row) => row.memberId === memberId)
    const persistedValue = memberRow?.valuesBySunday[dateSunday] ?? null

    if (persistedValue === amount) {
      return true
    }

    setSavingCellKeys((current) => new Set(current).add(cellKey))

    try {
      await monthlyContributionsService.saveMemberContribution({
        openingContributionId: sheet.openingContribution.id,
        memberId,
        dateSunday,
        amount,
      })

      setSheet((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          rows: current.rows.map((row) =>
            row.memberId === memberId
              ? {
                ...row,
                valuesBySunday: {
                  ...row.valuesBySunday,
                  [dateSunday]: amount,
                },
              }
              : row,
          ),
        }
      })

      return true
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error) ?? "Não foi possível salvar o valor informado")
      return false
    } finally {
      setSavingCellKeys((current) => {
        const next = new Set(current)
        next.delete(cellKey)
        return next
      })
    }
  }

  const handleSubmitOffer = async (payload: { dateSunday: string; amount: number }) => {
    if (!sheet) {
      return
    }

    setIsOfferSubmitting(true)

    try {
      const newOffer = await monthlyContributionsService.createOffer({
        openingContributionId: sheet.openingContribution.id,
        dateSunday: payload.dateSunday,
        amount: payload.amount,
      })

      setSheet((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          offersBySunday: {
            ...current.offersBySunday,
            [payload.dateSunday]: [...(current.offersBySunday[payload.dateSunday] ?? []), newOffer],
          },
        }
      })

      setIsOfferModalOpen(false)
      toast.success("Oferta adicionada com sucesso")
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error) ?? "Não foi possível salvar a oferta")
    } finally {
      setIsOfferSubmitting(false)
    }
  }

  const handleDeleteOffer = async (offerId: string) => {
    if (!sheet || !selectedOfferDetailsDate) {
      return
    }

    setDeletingOfferId(offerId)

    try {
      await monthlyContributionsService.deleteOffer(offerId)

      setSheet((current) => {
        if (!current) {
          return current
        }

        const nextEntries = (current.offersBySunday[selectedOfferDetailsDate] ?? [])
          .filter((entry) => entry.id !== offerId)

        return {
          ...current,
          offersBySunday: {
            ...current.offersBySunday,
            [selectedOfferDetailsDate]: nextEntries,
          },
        }
      })

      toast.success("Oferta excluída com sucesso")
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error) ?? "Não foi possível excluir a oferta")
    } finally {
      setDeletingOfferId(null)
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
        visible={loading || isOfferSubmitting || deletingOfferId !== null}
        text={
          deletingOfferId !== null
            ? "Excluindo oferta..."
            : isOfferSubmitting
              ? "Salvando oferta..."
              : "Carregando contribuições..."
        }
      />

      <OfferFormModal
        isOpen={isOfferModalOpen}
        sundays={sheet?.sundays ?? []}
        isSubmitting={isOfferSubmitting}
        onClose={() => {
          if (!isOfferSubmitting) setIsOfferModalOpen(false)
        }}
        onSubmit={handleSubmitOffer}
      />

      <OfferDetailsModal
        isOpen={selectedOfferDetailsDate !== null}
        sunday={selectedOfferSunday}
        entries={selectedOfferEntries}
        deletingOfferId={deletingOfferId}
        onClose={() => setSelectedOfferDetailsDate(null)}
        onDeleteOffer={handleDeleteOffer}
      />

      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Button
              type="button"
              variant="ghost"
              className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => navigate({ to: "/opening_contributions" })}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para aberturas
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {sheet ? `${sheet.openingContribution.month}/${sheet.openingContribution.year}` : "Contribuições"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Lance os dízimos por domingo, acompanhe as ofertas e confira os totais do período.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={() => setIsOfferModalOpen(true)} disabled={!sheet || sheet.sundays.length === 0}>
            <Gift className="h-4 w-4" />
            Nova oferta
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="min-w-0 border-border bg-card">
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Domingos no mês</CardTitle>
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-[1.4rem] font-bold text-foreground md:text-2xl xl:text-3xl">
                {summary.sundayCount}
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0 border-border bg-card">
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de dízimos</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="break-words text-[1.4rem] font-bold text-foreground md:text-2xl xl:text-3xl">
                {formatContributionCurrency(summary.totalTithes)}
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0 border-border bg-card">
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de ofertas</CardTitle>
                <Gift className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="break-words text-[1.4rem] font-bold text-foreground md:text-2xl xl:text-3xl">
                {formatContributionCurrency(summary.totalOffers)}
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0 border-border bg-card">
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total do mês</CardTitle>
                <Coins className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="break-words text-[1.4rem] font-bold text-emerald-400 md:text-2xl xl:text-3xl">
                {formatContributionCurrency(summary.grandTotal)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl text-foreground">Tabela de contribuições</CardTitle>
                <p className="text-sm text-muted-foreground">
                  A linha de ofertas permanece no topo e os valores de dízimos podem ser editados por domingo.
                </p>
              </div>

              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar contribuinte por nome..."
                  className="bg-input pl-9 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sheet ? (
              <ContributionsEditableTable
                rows={filteredRows}
                sundays={sheet.sundays}
                offersBySunday={sheet.offersBySunday}
                previewValues={previewValues}
                savingCellKeys={savingCellKeys}
                emptyMemberMessage="Nenhum contribuinte encontrado para a busca informada."
                onPreviewChange={handlePreviewChange}
                onCommitMemberValue={handleCommitMemberValue}
                onOpenOfferDetails={setSelectedOfferDetailsDate}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Não foi possível carregar a abertura selecionada.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-foreground">Top 3 contribuintes do mês</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ranking dos maiores valores de dízimo registrados neste período.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topContributors.length > 0 ? (
              topContributors.map((contributor, index) => (
                <div
                  key={contributor.memberId}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{contributor.memberName}</p>
                      <p className="text-sm text-muted-foreground">
                        {index === 0 ? "Maior valor do mês" : `${index + 1}º maior valor do mês`}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-emerald-400">
                    {formatContributionCurrency(contributor.total)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                Ainda não há dízimos registrados para montar o ranking deste mês.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
