import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Save, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

const exitTypes = [
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

function CurrencyInput({ value, onChange, placeholder, error }: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}) {
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
          "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-400",
          error && "border-red-500"
        )}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

function SearchableSelect({ options, value, onChange, placeholder, error }: {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}) {
  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(
          "bg-zinc-800 border-zinc-700 text-zinc-100",
          error && "border-red-500"
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          {options.map((option) => (
            <SelectItem 
              key={option} 
              value={option}
              className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

function CashFlowForm({ 
  title, 
  icon, 
  types, 
  onSubmit, 
  schema 
}: {
  title: string
  icon: React.ReactNode
  types: string[]
  onSubmit: (data: any) => void
  schema: z.ZodSchema
}) {
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [amount, setAmount] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Converter valor monetário para número
    const numericAmount = parseFloat(
      amount.replace(/[^\d,]/g, '').replace(',', '.')
    )
    
    const formData = {
      description: description.trim(),
      type,
      amount: numericAmount
    }
    
    try {
      const validatedData = schema.parse(formData)
      onSubmit(validatedData)
      
      // Limpar formulário
      setDescription('')
      setType('')
      setAmount('')
      setErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Descrição
          </label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Digite a descrição..."
            className={cn(
              "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-400",
              errors.description && "border-red-500"
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-400 mt-1">{errors.description}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Categoria
          </label>
          <SearchableSelect
            options={types}
            value={type}
            onChange={setType}
            placeholder="Selecione uma categoria..."
            error={errors.type}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Valor
          </label>
          <CurrencyInput
            value={amount}
            onChange={setAmount}
            placeholder="R$ 0,00"
            error={errors.amount}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar {title.slice(0, -1)}
        </Button>
      </form>
    </div>
  )
}

function CashFlowTable({ 
  title, 
  data, 
  onDelete 
}: {
  title: string
  data: Array<{ id: string; description: string; type: string; amount: number; date: string }>
  onDelete: (id: string) => void
}) {
  if (data.length === 0) {
    return (
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h3 className="text-xl font-bold text-zinc-100 mb-6">{title}</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-800 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="text-zinc-400">Nenhum registro encontrado</p>
          <p className="text-zinc-500 text-sm mt-1">Adicione o primeiro registro usando o formulário acima</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-zinc-100">{title}</h3>
        <div className="text-sm text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
          {data.length} {data.length === 1 ? 'registro' : 'registros'}
        </div>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {data.map((item) => (
          <div 
            key={item.id} 
            className="group bg-zinc-800 hover:bg-zinc-750 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all duration-200 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-zinc-100 truncate">
                    {item.description}
                  </h4>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                    title.includes('Entradas') 
                      ? "bg-green-900/30 text-green-300" 
                      : "bg-red-900/30 text-red-300"
                  )}>
                    {item.type}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{item.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-zinc-100">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.amount)}
                    </span>
                    <Button
                      onClick={() => onDelete(item.id)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-400 hover:bg-red-900/20 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-zinc-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-300">Total</span>
          <span className="text-lg font-bold text-zinc-100">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(data.reduce((sum, item) => sum + item.amount, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}

function BalanceInput({ label, value, onSave }: {
  label: string
  value: string
  onSave: (value: number) => void
}) {
  const [inputValue, setInputValue] = useState(value)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSave = () => {
    const numericValue = parseFloat(
      inputValue.replace(/[^\d,]/g, '').replace(',', '.')
    ) || 0
    
    onSave(numericValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setInputValue(value)
    setIsEditing(false)
  }

  return (
    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        {label}
      </label>
      
      {isEditing ? (
        <div className="flex gap-2">
          <CurrencyInput
            value={inputValue}
            onChange={setInputValue}
            placeholder="R$ 0,00"
          />
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="bg-zinc-600 hover:bg-zinc-500 border-zinc-500 text-zinc-100"
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <div 
          className="flex items-center justify-between p-3 bg-zinc-800 rounded border border-zinc-700 cursor-pointer hover:bg-zinc-750"
          onClick={() => setIsEditing(true)}
        >
          <span className="font-bold text-zinc-100">{inputValue}</span>
          <span className="text-xs text-zinc-400">Clique para editar</span>
        </div>
      )}
    </div>
  )
}

function TypeSummary({ title, data, icon }: {
  title: string
  data: Array<{ id: string; description: string; type: string; amount: number; date: string }>
  icon: React.ReactNode
}) {
  const typeTotals = data.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = 0
    }
    acc[item.type] += item.amount
    return acc
  }, {} as Record<string, number>)

  const sortedTypes = Object.entries(typeTotals)
    .sort(([,a], [,b]) => b - a)
    .filter(([,value]) => value > 0)

  if (sortedTypes.length === 0) {
    return null
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      </div>
      
      <div className="space-y-2">
        {sortedTypes.map(([type, total]) => (
          <div key={type} className="flex items-center justify-between p-3 bg-zinc-800 rounded border border-zinc-700">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-300">{type}</span>
                <span className="font-bold text-zinc-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(total)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Index() {
  const [entries, setEntries] = useState<(EntryData & { id: string; date: string })[]>([])
  const [exits, setExits] = useState<(ExitData & { id: string; date: string })[]>([])
  const [saldoInicial, setSaldoInicial] = useState<number>(0)
  const [saldoFinal, setSaldoFinal] = useState<number>(0)
  const [aplicacaoInvestimento, setAplicacaoInvestimento] = useState<number>(0)
  const [isLoaded, setIsLoaded] = useState(false)

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

  // Carregar dados quando o componente é montado
  useEffect(() => {
    loadFromLocalStorage()
  }, [])

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
        fill: { fgColor: { rgb: "22C55E" } }, // Verde
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
        fill: { fgColor: { rgb: "EF4444" } }, // Vermelho
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
        fill: { fgColor: { rgb: "3B82F6" } }, // Azul
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">LUMINA</h1>
          <p className="text-zinc-400">Controle de Fluxo de Caixa - Gerencie suas entradas e saídas financeiras</p>
        </div>

        {/* Resumo Financeiro */}
        <div className="flex flex-row md:flex-row gap-6 mb-8">
          <div className="bg-green-900/20 p-6 rounded-lg border border-green-800 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">Total Entradas</h3>
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalEntries)}
            </p>
          </div>

          <div className="bg-red-900/20 p-6 rounded-lg border border-red-800 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">Total Saídas</h3>
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalExits)}
            </p>
          </div>

          <div className={cn(
            "p-6 rounded-lg border flex-1",
            balance >= 0 
              ? "bg-blue-900/20 border-blue-800" 
              : "bg-orange-900/20 border-orange-800"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className={cn(
                "h-6 w-6",
                balance >= 0 ? "text-blue-400" : "text-orange-400"
              )} />
              <h3 className={cn(
                "text-lg font-semibold",
                balance >= 0 ? "text-blue-400" : "text-orange-400"
              )}>Saldo do Mês</h3>
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(balance)}
            </p>
          </div>
        </div>

        {/* Formulários e Listas */}
        <div className="flex flex-row lg:flex-row gap-8 mb-8">
          {/* Coluna de Entradas */}
          <div className="flex-1 space-y-6">
            <CashFlowForm
              title="Entradas"
              icon={<TrendingUp className="h-6 w-6 text-green-400" />}
              types={entryTypes}
              onSubmit={handleAddEntry}
              schema={entrySchema}
            />
            
            <CashFlowTable
              title="Entradas Registradas"
              data={entries}
              onDelete={handleDeleteEntry}
            />
          </div>
          
          {/* Coluna de Saídas */}
          <div className="flex-1 space-y-6">
            <CashFlowForm
              title="Saídas"
              icon={<TrendingDown className="h-6 w-6 text-red-400" />}
              types={exitTypes}
              onSubmit={handleAddExit}
              schema={exitSchema}
            />
            
            <CashFlowTable
              title="Saídas Registradas"
              data={exits}
              onDelete={handleDeleteExit}
            />
          </div>
        </div>

        {/* Campos de Saldo */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <BalanceInput
              label="Saldo Inicial"
              value={new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(saldoInicial)}
              onSave={setSaldoInicial}
            />
          </div>
          
          <BalanceInput
            label="Saldo Final"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(saldoFinal)}
            onSave={setSaldoFinal}
          />
          
          <BalanceInput
            label="Aplicação Investimento"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(aplicacaoInvestimento)}
            onSave={setAplicacaoInvestimento}
          />
        </div>

        {/* Resumos por Categoria */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="flex-1">
            <TypeSummary
              title="Resumo de Entradas por Categoria"
              data={entries}
              icon={<TrendingUp className="h-5 w-5 text-green-400" />}
            />
          </div>
          
          <div className="flex-1">
            <TypeSummary
              title="Resumo de Saídas por Categoria"
              data={exits}
              icon={<TrendingDown className="h-5 w-5 text-red-400" />}
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={exportToExcel}
            size="lg"
            className="text-lg font-medium shadow-lg bg-green-700 hover:bg-green-600 text-zinc-50 border border-green-500"
          >
            <Download className="h-5 w-5 mr-2" />
            Exportar para Excel
          </Button>

          <Button
            onClick={handleRestart}
            variant="destructive"
            className="text-lg font-medium shadow-lg bg-red-800 hover:bg-red-700 text-zinc-50 border border-red-600"
          >
            Restart
          </Button>
        </div>
      </div>
    </div>
  )
}