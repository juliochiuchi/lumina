import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import { TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

// Services
import { categoriesService, type Category } from '@/services/categoriesService'
import { cashFlowService, type CashFlow } from '@/services/cashFlowService'
import { inflowsService, type Inflow } from '@/services/inflowsService'
import { outflowsService, type Outflow } from '@/services/outflowsService'

// Componentes extraídos
import { CashFlowForm } from '@/components/CashFlowForm'
import { CashFlowTable } from '@/components/CashFlowTable'
import { BalanceInput } from '@/components/BalanceInput'
import { TypeSummary } from '@/components/TypeSummary'
import { ExportButtons } from '@/components/ExportButtons'
import { toast } from 'sonner'
import { FinancialSummary } from '@/components/FinancialSummary'
import { GlobalLoading } from '@/components/ui/global-loading'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_app/cash_flow')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id as string | undefined,
    }
  },
  component: Index,
})

// Schemas de validação
const entrySchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(100, 'Descrição muito longa'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  amount: z.number().positive('Valor deve ser positivo')
})

const exitSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(100, 'Descrição muito longa'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  amount: z.number().positive('Valor deve ser positivo')
})

type EntryData = z.infer<typeof entrySchema>
type ExitData = z.infer<typeof exitSchema>

function Index() {
  const { id } = Route.useSearch()
  const navigate = useNavigate()
  const [currentMovementId, setCurrentMovementId] = useState<string | undefined>(id)

  useEffect(() => {
    setCurrentMovementId(id)
  }, [id])

  useEffect(() => {
    if (currentMovementId) {
      console.log('Current Movement ID:', currentMovementId)
    }
  }, [currentMovementId])

  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    setCategoriesLoading(true)
    categoriesService.getAll()
      .then(setCategories)
      .catch(err => console.error('Erro ao buscar categorias:', err))
      .finally(() => setCategoriesLoading(false))
  }, [])

  const categoryNames = categories.map(c => c.name)

  const [rawInflows, setRawInflows] = useState<Inflow[]>([])
  const [rawOutflows, setRawOutflows] = useState<Outflow[]>([])
  const [saldoInicial, setSaldoInicial] = useState<number>(0)
  const [saldoFinal, setSaldoFinal] = useState<number>(0)
  const [aplicacaoInvestimento, setAplicacaoInvestimento] = useState<number>(0)
  const [resgateAplicacao, setResgateAplicacao] = useState<number>(0)
  // Removido controle de localStorage
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false)
  const [cashFlowLoading, setCashFlowLoading] = useState<boolean>(false)
  const [inflowsLoading, setInflowsLoading] = useState<boolean>(false)
  const [outflowsLoading, setOutflowsLoading] = useState<boolean>(false)

  // Estados para o mês e ano atual
  const [mesAtual, setMesAtual] = useState<string>('')
  const [anoAtual, setAnoAtual] = useState<number>(0)

  // Array com os nomes dos meses em português
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Função para obter o mês anterior e ano atual
  const obterMesEAnoAtual = () => {
    const hoje = new Date()
    const indiceMesAnterior = hoje.getMonth() - 1 // Mês anterior (0-11)
    const ano = hoje.getFullYear()

    // Se o mês anterior for -1 (janeiro atual), usar dezembro (índice 11)
    const indiceMesFinal = indiceMesAnterior < 0 ? 11 : indiceMesAnterior

    setMesAtual(nomesMeses[indiceMesFinal])
    setAnoAtual(ano)
  }

  // Estados para primeiro e último dia do mês atual
  const [primeiroDiaDoMes, setPrimeiroDiaDoMes] = useState<string>('')
  const [ultimoDiaDoMes, setUltimoDiaDoMes] = useState<string>('')

  // Função para formatar data no formato DD/MM/YYYY
  const formatarData = (data: Date): string => {
    const dia = data.getDate().toString().padStart(2, '0')
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    const ano = data.getFullYear()
    return `${dia}/${mes}/${ano}`
  }

  // Função para calcular primeiro e último dia do mês anterior
  const calcularDatasDoMes = () => {
    const hoje = new Date()

    // Primeiro dia do mês anterior
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)

    // Último dia do mês anterior
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth(), 0)

    setPrimeiroDiaDoMes(formatarData(primeiroDia))
    setUltimoDiaDoMes(formatarData(ultimoDia))
  }

  useEffect(() => {
    calcularDatasDoMes()
    obterMesEAnoAtual()

    if (currentMovementId) {
      loadCashFlowData(currentMovementId)
    }
  }, [currentMovementId])

  const loadCashFlowData = async (id: string) => {
    setCashFlowLoading(true)
    try {
      const data = await cashFlowService.getById(id)
      if (data) {
        setSaldoInicial(data.initial_balance || 0)
        setSaldoFinal(data.final_balance || 0)
        setAplicacaoInvestimento(data.investment_application || 0)
        setResgateAplicacao(data.redemption_application || 0)
      }
      await reloadInflows()
      await reloadOutflows()
    } catch (error) {
      console.error('Erro ao carregar dados do fluxo de caixa:', error)
    } finally {
      setCashFlowLoading(false)
    }
  }

  const handleUpdateBalance = async (field: keyof CashFlow, value: number) => {
    // Atualiza o estado local
    if (field === 'initial_balance') setSaldoInicial(value)
    if (field === 'final_balance') setSaldoFinal(value)
    if (field === 'investment_application') setAplicacaoInvestimento(value)
    if (field === 'redemption_application') setResgateAplicacao(value)

    // Se tiver ID, atualiza no banco
    if (currentMovementId) {
      try {
        await cashFlowService.update(currentMovementId, { [field]: value })
        toast.success('Valor atualizado com sucesso!')
      } catch (error) {
        console.error(`Erro ao atualizar ${field}:`, error)
        toast.error('Erro ao atualizar valor. Tente novamente.')
      }
    }
  }

  // Resolução de categoria e mapeadores (declarados como function para evitar TDZ)
  function getCategoryName(rawCategory: unknown): string {
    if (!categories || categories.length === 0) return 'Categoria'

    if (rawCategory && typeof rawCategory === 'object') {
      const obj = rawCategory as { id?: unknown; name?: unknown; category?: unknown }
      if (obj.id !== undefined) {
        const byObjId = categories.find(c => String(c.id) === String(obj.id))
        if (byObjId) return byObjId.name
      }
      if (obj.category !== undefined) {
        const byObjCat = categories.find(c => String(c.id) === String(obj.category))
        if (byObjCat) return byObjCat.name
      }
      if (typeof obj.name === 'string') {
        const nameNorm = obj.name.toLowerCase().trim()
        const byObjName = categories.find(c => c.name.toLowerCase().trim() === nameNorm)
        if (byObjName) return byObjName.name
      }
    }

    const normalized = String(rawCategory).trim()
    const byId = categories.find(c => String(c.id) === normalized)
    if (byId) return byId.name

    const byName = categories.find(c => c.name.toLowerCase().trim() === normalized.toLowerCase())
    return byName ? byName.name : 'Categoria'
  }

  function mapInflowToEntry(row: Inflow): (EntryData & { id: string; date: string }) {
    return {
      id: row.id,
      description: row.description,
      type: getCategoryName(row.category),
      amount: row.inflow_value,
      date: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')
    }
  }

  function mapOutflowToExit(row: Outflow): (ExitData & { id: string; date: string }) {
    return {
      id: row.id,
      description: row.description,
      type: getCategoryName(row.category),
      amount: row.outflow_value,
      date: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')
    }
  }

  const entries = useMemo(
    () => rawInflows.map(mapInflowToEntry),
    [rawInflows, categories]
  )
  const exits = useMemo(
    () => rawOutflows.map(mapOutflowToExit),
    [rawOutflows, categories]
  )
  const totalEntries = entries.reduce((sum, entry) => sum + entry.amount, 0)
  const totalExits = exits.reduce((sum, exit) => sum + exit.amount, 0)
  const balance = totalEntries - totalExits
  const saldoMesComResgate = balance + resgateAplicacao

  // Carregamento de entradas/saídas do Supabase

  const reloadInflows = async () => {
    if (!currentMovementId) return
    try {
      setInflowsLoading(true)
      const rows = await inflowsService.listByCashFlow(currentMovementId)
      setRawInflows(rows)
    } catch (error) {
      console.error('Erro ao carregar entradas:', error)
      toast.error('Erro ao carregar entradas')
    } finally {
      setInflowsLoading(false)
    }
  }

  const reloadOutflows = async () => {
    if (!currentMovementId) return
    try {
      setOutflowsLoading(true)
      const rows = await outflowsService.listByCashFlow(currentMovementId)
      setRawOutflows(rows)
    } catch (error) {
      console.error('Erro ao carregar saídas:', error)
      toast.error('Erro ao carregar saídas')
    } finally {
      setOutflowsLoading(false)
    }
  }

  useEffect(() => {
    if (currentMovementId) {
      reloadInflows()
      reloadOutflows()
    }
  }, [categories, currentMovementId])

  const handleAddEntry = async (data: EntryData) => {
    if (!currentMovementId) {
      toast.error('Crie um fluxo de caixa antes de adicionar entradas.')
      return
    }
    const category = categories.find(c => c.name === data.type)
    if (!category) {
      toast.error('Categoria inválida para entrada.')
      return
    }
    try {
      await inflowsService.create({
        cash_flow: currentMovementId,
        category: category.id,
        description: data.description,
        inflow_value: data.amount
      })
      toast.success('Entrada adicionada com sucesso!')
      await reloadInflows()
    } catch (error) {
      console.error('Erro ao adicionar entrada:', error)
      toast.error('Erro ao adicionar entrada. Tente novamente.')
    }
  }

  const handleAddExit = async (data: ExitData) => {
    if (!currentMovementId) {
      toast.error('Crie um fluxo de caixa antes de adicionar saídas.')
      return
    }
    const category = categories.find(c => c.name === data.type)
    if (!category) {
      toast.error('Categoria inválida para saída.')
      return
    }
    try {
      await outflowsService.create({
        cash_flow: currentMovementId,
        category: category.id,
        description: data.description,
        outflow_value: data.amount
      })
      toast.success('Saída adicionada com sucesso!')
      await reloadOutflows()
    } catch (error) {
      console.error('Erro ao adicionar saída:', error)
      toast.error('Erro ao adicionar saída. Tente novamente.')
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      await inflowsService.delete(id)
      toast.success('Entrada excluída com sucesso!')
      await reloadInflows()
    } catch (error) {
      console.error('Erro ao excluir entrada:', error)
      toast.error('Erro ao excluir entrada. Tente novamente.')
    }
  }

  const handleDeleteExit = async (id: string) => {
    try {
      await outflowsService.delete(id)
      toast.success('Saída excluída com sucesso!')
      await reloadOutflows()
    } catch (error) {
      console.error('Erro ao excluir saída:', error)
      toast.error('Erro ao excluir saída. Tente novamente.')
    }
  }

  const handleRestart = () => {
    if (window.confirm('Tem certeza que deseja reiniciar?')) {
      setRawInflows([])
      setRawOutflows([])
      setSaldoInicial(0)
      setSaldoFinal(0)
      setAplicacaoInvestimento(0)
      setResgateAplicacao(0)
      navigate({ to: '/' })
    }
  }

  // Função para exportar para Excel
  const exportToExcel = () => {
    // Preparar dados das entradas
    const entriesData = entries.map(entry => ({
      'Descrição': entry.description,
      'Categoria': entry.type,
      'Valor': new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(entry.amount),
      'Data': entry.date
    }))

    // Preparar dados das saídas
    const exitsData = exits.map(exit => ({
      'Descrição': exit.description,
      'Categoria': exit.type,
      'Valor': new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(exit.amount),
      'Data': exit.date
    }))

    // Calcular totais por categoria para entradas
    const entryTypeTotals = entries.reduce((acc, entry) => {
      if (!acc[entry.type]) {
        acc[entry.type] = 0
      }
      acc[entry.type] += entry.amount
      return acc
    }, {} as Record<string, number>)

    // Calcular totais por categoria para saídas
    const exitTypeTotals = exits.reduce((acc, exit) => {
      if (!acc[exit.type]) {
        acc[exit.type] = 0
      }
      acc[exit.type] += exit.amount
      return acc
    }, {} as Record<string, number>)

    // Criar workbook
    const wb = XLSX.utils.book_new()

    // Criar planilha de ENTRADAS com totais
    const entriesWithSummary = [
      ...entriesData,
      {},
      { 'Descrição': 'TOTAIS POR CATEGORIA', 'Categoria': '', 'Valor': '', 'Data': '' },
      ...Object.entries(entryTypeTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([type, total]) => ({
          'Descrição': type,
          'Categoria': '',
          'Valor': new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(total),
          'Data': ''
        })),
      {},
      {
        'Descrição': 'TOTAL GERAL DE ENTRADAS',
        'Categoria': '',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalEntries),
        'Data': ''
      }
    ]

    const wsEntries = XLSX.utils.json_to_sheet(entriesWithSummary)

    // Aplicar cor verde nas células de cabeçalho e totais
    const entriesRange = XLSX.utils.decode_range(wsEntries['!ref'] || 'A1')

    // Colorir cabeçalho
    for (let col = entriesRange.s.c; col <= entriesRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!wsEntries[cellAddress]) continue
      wsEntries[cellAddress].s = {
        fill: { fgColor: "22C55E" }, // Verde
        font: { color: { rgb: "FFFFFF" }, bold: true }
      }
    }

    // Ajustar largura das colunas
    wsEntries['!cols'] = [
      { wch: 30 }, // Descrição
      { wch: 20 }, // Categoria
      { wch: 15 }, // Valor
      { wch: 12 }  // Data
    ]

    // Criar planilha de SAÍDAS
    const exitsWithSummary = [
      ...exitsData,
      {},
      { 'Descrição': 'TOTAIS POR CATEGORIA', 'Categoria': '', 'Valor': '', 'Data': '' },
      ...Object.entries(exitTypeTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([type, total]) => ({
          'Descrição': type,
          'Categoria': '',
          'Valor': new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(total),
          'Data': ''
        })),
      {},
      {
        'Descrição': 'TOTAL GERAL DE SAÍDAS',
        'Categoria': '',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalExits),
        'Data': ''
      }
    ]

    const wsExits = XLSX.utils.json_to_sheet(exitsWithSummary)

    // Aplicar cor vermelha nas células de cabeçalho e totais
    const exitsRange = XLSX.utils.decode_range(wsExits['!ref'] || 'A1')

    // Colorir cabeçalho
    for (let col = exitsRange.s.c; col <= exitsRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!wsExits[cellAddress]) continue
      wsExits[cellAddress].s = {
        fill: { fgColor: "EF4444" }, // Vermelho
        font: { color: { rgb: "FFFFFF" }, bold: true }
      }
    }

    // Ajustar largura das colunas
    wsExits['!cols'] = [
      { wch: 30 }, // Descrição
      { wch: 20 }, // Categoria
      { wch: 15 }, // Valor
      { wch: 12 }  // Data
    ]

    // Criar planilha de RESUMO GERAL
    const saldoMesComResgate = balance + resgateAplicacao
    const summaryData = [
      {
        'Descrição': 'Total de Entradas',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalEntries)
      },
      {
        'Descrição': 'Total de Saídas',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalExits)
      },
      {
        'Descrição': 'Saldo do Mês',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(saldoMesComResgate)
      },
      {},
      {
        'Descrição': 'Saldo Inicial',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(saldoInicial)
      },
      {
        'Descrição': 'Saldo Final',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(saldoFinal)
      },
      {
        'Descrição': 'Aplicação Investimento',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(aplicacaoInvestimento)
      },
      {
        'Descrição': 'Resgate Aplicação',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(resgateAplicacao)
      }
    ]

    const wsSummary = XLSX.utils.json_to_sheet(summaryData)

    // Aplicar cor azul nas células de cabeçalho
    const summaryRange = XLSX.utils.decode_range(wsSummary['!ref'] || 'A1')

    // Colorir cabeçalho
    for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!wsSummary[cellAddress]) continue
      wsSummary[cellAddress].s = {
        fill: { fgColor: "3B82F6" }, // Azul
        font: { color: { rgb: "FFFFFF" }, bold: true }
      }
    }

    // Ajustar largura das colunas
    wsSummary['!cols'] = [
      { wch: 30 }, // Descrição
      { wch: 20 }  // Valor
    ]

    // Adicionar planilhas ao workbook
    XLSX.utils.book_append_sheet(wb, wsEntries, 'Entradas')
    XLSX.utils.book_append_sheet(wb, wsExits, 'Saídas')
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Geral')

    // Salvar arquivo
    const fileName = `fluxo-caixa-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // Função para exportar para DOCX
  const exportToDocx = async () => {
    // Calcular totais por categoria para entradas
    const entryTypeTotals = entries.reduce((acc, entry) => {
      if (!acc[entry.type]) {
        acc[entry.type] = 0
      }
      acc[entry.type] += entry.amount
      return acc
    }, {} as Record<string, number>)

    // Calcular totais por categoria para saídas
    const exitTypeTotals = exits.reduce((acc, exit) => {
      if (!acc[exit.type]) {
        acc[exit.type] = 0
      }
      acc[exit.type] += exit.amount
      return acc
    }, {} as Record<string, number>)

    // Calcular total de entradas incluindo resgateAplicacao
    const totalEntriesWithResgate = totalEntries + resgateAplicacao

    // Criar documento
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Seção VAZIA
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 1450, after: 1450 },
          }),

          // Título
          new Paragraph({
            children: [
              new TextRun({
                text: `PRESTAÇÃO DE CONTAS MÊS DE ${mesAtual.toUpperCase()} DE ${anoAtual}`,
                bold: true,
                size: 24,
                font: "Calibri",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Seção ENTRADAS
          new Paragraph({
            children: [
              new TextRun({
                text: "ENTRADAS",
                bold: true,
                size: 20,
                font: "Calibri",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),

          // Tabela de Entradas
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              ...Object.entries(entryTypeTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([type, total]) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: type.toUpperCase(), bold: true, font: "Calibri", size: 20 })] })],
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        margins: {
                          top: 30,
                          bottom: 30,
                          left: 80,
                          right: 80,
                        },
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({
                            text: new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(total),
                            bold: true,
                            font: "Calibri",
                            size: 20
                          })],
                          alignment: AlignmentType.RIGHT
                        })],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        margins: {
                          top: 30,
                          bottom: 30,
                          left: 80,
                          right: 80,
                        },
                      }),
                    ],
                  })
                ),
              // Adicionar linha do Resgate Aplicação
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "RESGATE APLICAÇÃO", bold: true, font: "Calibri", size: 20 })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(resgateAplicacao),
                        bold: true,
                        font: "Calibri",
                        size: 20
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true, font: "Calibri", size: 20 })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(totalEntriesWithResgate),
                        bold: true,
                        font: "Calibri",
                        size: 20
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                ],
              }),
            ],
          }),

          // Seção SAÍDAS
          new Paragraph({
            children: [
              new TextRun({
                text: "SAÍDAS",
                bold: true,
                size: 20,
                font: "Calibri",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),

          // Tabela de Saídas
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              ...Object.entries(exitTypeTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([type, total]) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: type.toUpperCase(), bold: true, font: "Calibri" })] })],
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        margins: {
                          top: 30,
                          bottom: 30,
                          left: 80,
                          right: 80,
                        },
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({
                            text: new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(total),
                            bold: true,
                            font: "Calibri"
                          })],
                          alignment: AlignmentType.RIGHT
                        })],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        margins: {
                          top: 30,
                          bottom: 30,
                          left: 80,
                          right: 80,
                        },
                      }),
                    ],
                  })
                ),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true, font: "Calibri" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(totalExits),
                        bold: true,
                        font: "Calibri"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                ],
              }),
            ],
          }),

          // Seção SALDO DO MES
          new Paragraph({
            children: [
              new TextRun({
                text: "", // titulo da sessao caso houver
                bold: true,
                size: 24,
                font: "Calibri",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),

          // Saldo do Mês
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "SALDO DO MÊS", bold: true, font: "Calibri" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(saldoMesComResgate),
                        bold: true,
                        font: "Calibri"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                ],
              }),
            ],
          }),

          // Seção SALDO DISPONÍVEL
          new Paragraph({
            children: [
              new TextRun({
                text: "SALDO DISPONÍVEL",
                bold: true,
                size: 20,
                font: "Calibri",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),

          // Tabela Saldo Disponível
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `SALDO INICIAL (${primeiroDiaDoMes})`, bold: true, font: "Calibri" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(saldoInicial),
                        bold: true,
                        font: "Calibri"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `SALDO FINAL (${ultimoDiaDoMes})`, bold: true, font: "Calibri" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(saldoFinal),
                        bold: true,
                        font: "Calibri"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                ],
              }),
            ],
          }),

          // Seção FUNDOS DE INVESTIMENTO
          new Paragraph({
            children: [
              new TextRun({
                text: "FUNDOS DE INVESTIMENTO",
                bold: true,
                size: 20,
                font: "Calibri",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),

          // Tabela Fundos de Investimento
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "APLICAÇÃO", bold: true, font: "Calibri" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(aplicacaoInvestimento),
                        bold: true,
                        font: "Calibri"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 30,
                      bottom: 30,
                      left: 80,
                      right: 80,
                    },
                  }),
                ],
              }),
            ],
          }),
        ],
      }],
    })

    // Gerar e baixar o arquivo
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `prestacao-contas-${new Date().toISOString().slice(0, 7)}.docx`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalLoading visible={categoriesLoading || cashFlowLoading} text="Carregando dados..." />
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Home
          </Link>
        </div>

        {inflowsLoading || outflowsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : (
          <FinancialSummary
            totalEntries={totalEntries}
            totalExits={totalExits}
            balance={balance}
            totalEntriesWithRedemption={totalEntries + resgateAplicacao}
            balanceWithRedemption={balance + resgateAplicacao}
          />
        )}

        {/* Formulários e tabelas - lado a lado em telas grandes, empilhados em pequenas */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-6 sm:mb-8 w-full">
          <div className="flex-1 space-y-6">
            <CashFlowForm
              title="Adicionar Entrada"
              titleNotification="Entrada"
              icon={<TrendingUp className="h-5 w-5 text-green-400" />}
              types={categoryNames}
              onSubmit={handleAddEntry}
              schema={entrySchema}
            />
            {inflowsLoading ? (
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 overflow-hidden">
                <div className="p-6 border-b border-zinc-800/50">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ) : (
              <CashFlowTable title="Entradas Registradas" data={entries} onDelete={handleDeleteEntry} variant="entry" />
            )}
          </div>

          <div className="flex-1 space-y-6">
            <CashFlowForm
              title="Adicionar Saída"
              titleNotification="Saída"
              icon={<TrendingDown className="h-5 w-5 text-red-400" />}
              types={categoryNames}
              onSubmit={handleAddExit}
              schema={exitSchema}
            />
            {outflowsLoading ? (
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 overflow-hidden">
                <div className="p-6 border-b border-zinc-800/50">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ) : (
              <CashFlowTable title="Saídas Registradas" data={exits} onDelete={handleDeleteExit} variant="exit" />
            )}
          </div>
        </div>

        {/* Saldos - sempre empilhados conforme solicitado */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          <BalanceInput
            label="Saldo Inicial"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoInicial)}
            onSave={(value) => handleUpdateBalance('initial_balance', value)}
          />
          <BalanceInput
            label="Saldo Final"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoFinal)}
            onSave={(value) => handleUpdateBalance('final_balance', value)}
          />
          <BalanceInput
            label="Aplicação Investimento"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aplicacaoInvestimento)}
            onSave={(value) => handleUpdateBalance('investment_application', value)}
          />
          <BalanceInput
            label="Resgate Aplicação"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resgateAplicacao)}
            onSave={(value) => handleUpdateBalance('redemption_application', value)}
          />
        </div>

        {/* Resumos por categoria - lado a lado em telas grandes, empilhados em pequenas */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6 sm:mb-8">
          <div className="flex-1">
            {inflowsLoading ? (
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-6 w-64" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ) : (
              <TypeSummary
                title="Resumo de Entradas por Categoria"
                data={entries}
                icon={<TrendingUp className="h-5 w-5 text-green-400" />}
              />
            )}
          </div>
          <div className="flex-1">
            {outflowsLoading ? (
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-6 w-64" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ) : (
              <TypeSummary
                title="Resumo de Saídas por Categoria"
                data={exits}
                icon={<TrendingDown className="h-5 w-5 text-red-400" />}
              />
            )}
          </div>
        </div>

        <ExportButtons
          onExportExcel={exportToExcel}
          onExportDocx={exportToDocx}
          onRestart={handleRestart}
        />
      </div>
    </div>
  )
}
