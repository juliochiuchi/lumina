import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { TrendingUp, TrendingDown } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

// Componentes extraídos
import { CashFlowForm } from '@/components/CashFlowForm'
import { CashFlowTable } from '@/components/CashFlowTable'
import { BalanceInput } from '@/components/BalanceInput'
import { TypeSummary } from '@/components/TypeSummary'
import { ExportButtons } from '@/components/ExportButtons'
import { FinancialSummary } from '@/components/FinancialSummary'

export const Route = createFileRoute('/_app/')({
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

// Tipos disponíveis
const entryTypes = [
  'Dízimo',
  'Oferta',
  'Oferta Construção',
  'Aluguel',
  'Resgate',
  'Reembolso',
  'Jantar Coordenadoria',
  'Despesas Pastor',
  'Tarifa Banco',
  'Manutenção',
  'Energia',
  'Água',
  'Limpeza',
  'Contabilidade',
  'AG',
  'Presbitério Rio Preto',
  'Internet',
  'Missões',
  'Ministérios',
  'Mercado',
  'Eventos',
  'Lembranças',
  'Equipamentos',
  'Documentos Administrativos',
  'Ajuda de Custo',
  'Investimentos',
  'Fúnebre',
  'Aplicação Resgate',
  'Entrada',
]

const exitTypes = [...entryTypes]



function Index() {
  const [entries, setEntries] = useState<(EntryData & { id: string; date: string })[]>([])
  const [exits, setExits] = useState<(ExitData & { id: string; date: string })[]>([])
  const [saldoInicial, setSaldoInicial] = useState<number>(0)
  const [saldoFinal, setSaldoFinal] = useState<number>(0)
  const [aplicacaoInvestimento, setAplicacaoInvestimento] = useState<number>(0)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Estados para o mês e ano atual
  const [mesAtual, setMesAtual] = useState<string>('')
  const [anoAtual, setAnoAtual] = useState<number>(0)

  // Array com os nomes dos meses em português
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Função para obter o mês e ano atual
  const obterMesEAnoAtual = () => {
    const hoje = new Date()
    const indiceMes = hoje.getMonth() // 0-11
    const ano = hoje.getFullYear()
    
    setMesAtual(nomesMeses[indiceMes])
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

  // Função para calcular primeiro e último dia do mês atual
  const calcularDatasDoMes = () => {
    const hoje = new Date()
    
    // Primeiro dia do mês atual
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    
    // Último dia do mês atual
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    
    setPrimeiroDiaDoMes(formatarData(primeiroDia))
    setUltimoDiaDoMes(formatarData(ultimoDia))
  }

  useEffect(() => {
    calcularDatasDoMes() // calcular as datas quando o componente é montado
    obterMesEAnoAtual() // obter mês e ano quando o componente é montado
    loadFromLocalStorage() // carregar dados quando o componente é montado
  }, [])

  // Calcular totais
  const totalEntries = entries.reduce((sum, entry) => sum + entry.amount, 0)
  const totalExits = exits.reduce((sum, exit) => sum + exit.amount, 0)
  const balance = totalEntries - totalExits

  // Flag para controlar se os dados foram carregados
  // Função para salvar dados no localStorage
  const saveToLocalStorage = () => {
    if (!isLoaded) return // Não salvar se ainda não carregou os dados
    
    const data = {
      entries,
      exits,
      saldoInicial,
      saldoFinal,
      aplicacaoInvestimento,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem('fluxoCaixaData', JSON.stringify(data))
    console.log('Dados salvos no localStorage:', data)
  }

  // Função para carregar dados do localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('fluxoCaixaData')
      if (savedData) {
        const data = JSON.parse(savedData)
        console.log('Dados carregados do localStorage:', data)
        
        setEntries(data.entries || [])
        setExits(data.exits || [])
        setSaldoInicial(data.saldoInicial || 0)
        setSaldoFinal(data.saldoFinal || 0)
        setAplicacaoInvestimento(data.aplicacaoInvestimento || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error)
    } finally {
      setIsLoaded(true) // Marcar como carregado independentemente do resultado
    }
  }

  // Salvar dados sempre que houver mudanças
  useEffect(() => {
    saveToLocalStorage()
  }, [entries, exits, saldoInicial, saldoFinal, aplicacaoInvestimento, isLoaded])

  const handleAddEntry = (data: EntryData) => {
    const newEntry = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR')
    }
    setEntries([...entries, newEntry])
  }

  const handleAddExit = (data: ExitData) => {
    const newExit = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR')
    }
    setExits([...exits, newExit])
  }

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id))
  }

  const handleDeleteExit = (id: string) => {
    setExits(exits.filter(exit => exit.id !== id))
  }

  const handleRestart = () => {
    if (window.confirm('Tem certeza que deseja reiniciar? Todos os dados serão perdidos.')) {
      setEntries([])
      setExits([])
      setSaldoInicial(0)
      setSaldoFinal(0)
      setAplicacaoInvestimento(0)
      localStorage.removeItem('fluxoCaixaData')
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
        .sort(([,a], [,b]) => b - a)
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
        .sort(([,a], [,b]) => b - a)
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
        }).format(balance)
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
          // Título
          new Paragraph({
            children: [
              new TextRun({
                text: `PRESTAÇÃO DE CONTAS MÊS DE ${mesAtual} DE ${anoAtual}`,
                bold: true,
                size: 28,
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Seção ENTRADAS
          new Paragraph({
            children: [
              new TextRun({
                text: "ENTRADAS",
                bold: true,
                size: 24,
                font: "Arial",
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
                .sort(([,a], [,b]) => b - a)
                .map(([type, total]) => 
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: type.toUpperCase(), bold: true, font: "Arial" })] })],
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        margins: {
                          top: 100,
                          bottom: 100,
                          left: 100,
                          right: 100,
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
                            font: "Arial"
                          })],
                          alignment: AlignmentType.RIGHT
                        })],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        margins: {
                          top: 100,
                          bottom: 100,
                          left: 100,
                          right: 100,
                        },
                      }),
                    ],
                  })
                ),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true, font: "Arial" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(totalEntries),
                        bold: true,
                        font: "Arial"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
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
                size: 24,
                font: "Arial",
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
                .sort(([,a], [,b]) => b - a)
                .map(([type, total]) => 
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: type.toUpperCase(), bold: true, font: "Arial" })] })],
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        margins: {
                          top: 100,
                          bottom: 100,
                          left: 100,
                          right: 100,
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
                            font: "Arial"
                          })],
                          alignment: AlignmentType.RIGHT
                        })],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        margins: {
                          top: 100,
                          bottom: 100,
                          left: 100,
                          right: 100,
                        },
                      }),
                    ],
                  })
                ),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true, font: "Arial" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
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
                        font: "Arial"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
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
                text: "SALDO DO MÊS",
                bold: true,
                size: 24,
                font: "Arial",
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
                    children: [new Paragraph({ children: [new TextRun({ text: "", bold: true, font: "Arial" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(balance),
                        bold: true,
                        font: "Arial"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
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
                size: 24,
                font: "Arial",
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
                    children: [new Paragraph({ children: [new TextRun({ text: `SALDO INICIAL (${primeiroDiaDoMes})`, bold: true, font: "Arial" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
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
                        font: "Arial"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `SALDO FINAL (${ultimoDiaDoMes})`, bold: true, font: "Arial" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
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
                        font: "Arial"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
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
                size: 24,
                font: "Arial",
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
                    children: [new Paragraph({ children: [new TextRun({ text: "APLICAÇÃO", bold: true, font: "Arial" })] })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
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
                        font: "Arial"
                      })],
                      alignment: AlignmentType.RIGHT
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-poppins tracking-widest">LUMINA</h1>
          <p className="text-zinc-400">Controle de Fluxo de Caixa - Gerencie suas entradas e saídas financeiras</p>
        </div>

        <FinancialSummary totalEntries={totalEntries} totalExits={totalExits} balance={balance} />

        <div className="flex flex-row lg:flex-col gap-8 mb-8 w-full">
          <div className="space-y-6 w-full">
            <CashFlowForm
              title="Adicionar Entrada"
              titleNotification="Entrada"
              icon={<TrendingUp className="h-5 w-5 text-green-400" />}
              types={entryTypes}
              onSubmit={handleAddEntry}
              schema={entrySchema}
            />
            <CashFlowTable title="Entradas Registradas" data={entries} onDelete={handleDeleteEntry} />
          </div>

          <div className="space-y-6 w-full">
            <CashFlowForm
              title="Adicionar Saída"
              titleNotification="Saída"
              icon={<TrendingDown className="h-5 w-5 text-red-400" />}
              types={exitTypes}
              onSubmit={handleAddExit}
              schema={exitSchema}
            />
            <CashFlowTable title="Saídas Registradas" data={exits} onDelete={handleDeleteExit} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <BalanceInput
            label="Saldo Inicial"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoInicial)}
            onSave={setSaldoInicial}
          />
          <BalanceInput
            label="Saldo Final"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoFinal)}
            onSave={setSaldoFinal}
          />
          <BalanceInput
            label="Aplicação Investimento"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aplicacaoInvestimento)}
            onSave={setAplicacaoInvestimento}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <TypeSummary
            title="Resumo de Entradas por Categoria"
            data={entries}
            icon={<TrendingUp className="h-5 w-5 text-green-400" />}
          />
          <TypeSummary
            title="Resumo de Saídas por Categoria"
            data={exits}
            icon={<TrendingDown className="h-5 w-5 text-red-400" />}
          />
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