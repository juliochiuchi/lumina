import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Search, Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Save, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

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
  'Vendas',
  'Serviços',
  'Investimentos',
  'Empréstimos',
  'Outros Recebimentos'
]

const exitTypes = [
  'Fornecedores',
  'Salários',
  'Aluguel',
  'Utilities',
  'Marketing',
  'Impostos',
  'Outros Gastos'
]

// Componente de Input de Moeda
function CurrencyInput({ value, onChange, placeholder, error }: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}) {
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseFloat(numbers) / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount || 0)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    onChange(formatted)
  }

  return (
    <div className="relative">
      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
          error ? "border-red-500" : "border-gray-300"
        )}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

// Componente de Dropdown com Busca
function SearchableSelect({ options, value, onChange, placeholder, error }: {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : value}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className={cn(
            "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
            error ? "border-red-500" : "border-gray-300"
          )}
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                {option}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">Nenhuma opção encontrada</div>
          )}
        </div>
      )}
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

// Componente de Formulário
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
  const [formData, setFormData] = useState({
    description: '',
    type: '',
    amount: 'R$ 0,00'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Converter valor da moeda para número
    const numericAmount = parseFloat(
      formData.amount.replace(/[R$\s.]/g, '').replace(',', '.')
    )
    
    const dataToValidate = {
      ...formData,
      amount: numericAmount
    }
    
    try {
      const validData = schema.parse(dataToValidate)
      onSubmit(validData)
      setFormData({ description: '', type: '', amount: 'R$ 0,00' })
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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Digite a descrição..."
            className={cn(
              "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
              errors.description ? "border-red-500" : "border-gray-300"
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <SearchableSelect
            options={types}
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value })}
            placeholder="Selecione o tipo..."
            error={errors.type}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor
          </label>
          <CurrencyInput
            value={formData.amount}
            onChange={(value) => setFormData({ ...formData, amount: value })}
            placeholder="R$ 0,00"
            error={errors.amount}
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </form>
    </div>
  )
}

// Componente de Tabela
function CashFlowTable({ 
  title, 
  data, 
  onDelete 
}: {
  title: string
  data: Array<{ id: string; description: string; type: string; amount: number; date: string }>
  onDelete: (id: string) => void
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="text-lg font-bold text-blue-600">
            Total: {formatCurrency(total)}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Novo componente para inputs de saldo
function BalanceInput({ label, value, onSave }: {
  label: string
  value: string
  onSave: (value: number) => void
}) {
  const [inputValue, setInputValue] = useState('')
  const [displayValue, setDisplayValue] = useState('R$ 0,00')

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    const floatValue = parseFloat(numericValue) / 100
    
    if (isNaN(floatValue)) {
      return 'R$ 0,00'
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(floatValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
  }

  const handleSave = () => {
    const numericValue = inputValue.replace(/\D/g, '')
    const floatValue = parseFloat(numericValue) / 100
    
    if (!isNaN(floatValue)) {
      const formatted = formatCurrency(inputValue)
      setDisplayValue(formatted)
      onSave(floatValue)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formatCurrency(inputValue)}
            onChange={handleInputChange}
            placeholder="R$ 0,00"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar
          </button>
        </div>
      </div>
      <div className="min-w-[120px]">
        <span className="text-sm text-gray-500">Valor Salvo:</span>
        <div className="text-lg font-semibold text-gray-900">
          {displayValue}
        </div>
      </div>
    </div>
  )
}

function Index() {
  const [entries, setEntries] = useState<Array<{
    id: string
    description: string
    type: string
    amount: number
    date: string
  }>>([])
  
  const [exits, setExits] = useState<Array<{
    id: string
    description: string
    type: string
    amount: number
    date: string
  }>>([])

  // Estados para os novos campos de saldo
  const [saldoInicial, setSaldoInicial] = useState(0)
  const [saldoFinal, setSaldoFinal] = useState(0)
  const [aplicacaoInvestimento, setAplicacaoInvestimento] = useState(0)

  const handleAddEntry = (data: EntryData) => {
    const newEntry = {
      id: Date.now().toString(),
      ...data,
      date: new Date().toLocaleDateString('pt-BR')
    }
    setEntries([...entries, newEntry])
  }

  const handleAddExit = (data: ExitData) => {
    const newExit = {
      id: Date.now().toString(),
      ...data,
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

  // Função para exportar para Excel
  const exportToExcel = () => {
    // Preparar dados das entradas
    const entriesData = entries.map(entry => ({
      'Tipo': 'Entrada',
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
      'Tipo': 'Saída',
      'Descrição': exit.description,
      'Categoria': exit.type,
      'Valor': new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(exit.amount),
      'Data': exit.date
    }))

    // Combinar todos os dados
    const allData = [...entriesData, ...exitsData]

    // Adicionar linha de resumo
    const summaryData = [
      {},
      {
        'Tipo': 'RESUMO',
        'Descrição': 'Total de Entradas',
        'Categoria': '',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalEntries),
        'Data': ''
      },
      {
        'Tipo': 'RESUMO',
        'Descrição': 'Total de Saídas',
        'Categoria': '',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalExits),
        'Data': ''
      },
      {
        'Tipo': 'RESUMO',
        'Descrição': 'Saldo Final',
        'Categoria': '',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(balance),
        'Data': ''
      },
      {},
      {
        'Tipo': 'CONTROLES',
        'Descrição': 'Saldo Inicial',
        'Categoria': '',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(saldoInicial),
        'Data': ''
      },
      {
        'Tipo': 'CONTROLES',
        'Descrição': 'Saldo Final',
        'Categoria': '',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(saldoFinal),
        'Data': ''
      },
      {
        'Tipo': 'CONTROLES',
        'Descrição': 'Aplicação Investimento',
        'Categoria': '',
        'Valor': new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(aplicacaoInvestimento),
        'Data': ''
      }
    ]

    const finalData = [...allData, ...summaryData]

    // Criar workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(finalData)

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 15 }, // Tipo
      { wch: 30 }, // Descrição
      { wch: 20 }, // Categoria
      { wch: 15 }, // Valor
      { wch: 12 }  // Data
    ]
    ws['!cols'] = colWidths

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Fluxo de Caixa')

    // Gerar nome do arquivo com data atual
    const today = new Date()
    const fileName = `fluxo-caixa-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`

    // Fazer download
    XLSX.writeFile(wb, fileName)
  }

  const totalEntries = entries.reduce((sum, entry) => sum + entry.amount, 0)
  const totalExits = exits.reduce((sum, exit) => sum + exit.amount, 0)
  const balance = totalEntries - totalExits

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Controle de Fluxo de Caixa
          </h1>
          <p className="text-gray-600">
            Gerencie suas entradas e saídas financeiras
          </p>
          
          {/* Resumo Financeiro */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Total Entradas</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalEntries)}
              </p>
            </div>
            
            <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Total Saídas</span>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalExits)}
              </p>
            </div>
            
            <div className={cn(
              "flex-1 border rounded-lg p-4",
              balance >= 0 
                ? "bg-blue-50 border-blue-200" 
                : "bg-orange-50 border-orange-200"
            )}>
              <div className="flex items-center gap-2">
                <DollarSign className={cn(
                  "h-5 w-5",
                  balance >= 0 ? "text-blue-600" : "text-orange-600"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  balance >= 0 ? "text-blue-800" : "text-orange-800"
                )}>Saldo</span>
              </div>
              <p className={cn(
                "text-2xl font-bold mt-1",
                balance >= 0 ? "text-blue-600" : "text-orange-600"
              )}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Layout Principal com Flexbox - Duas Colunas */}
        <div className="flex flex-row gap-8">
          {/* Coluna Esquerda - ENTRADAS */}
          <div className="flex-1 flex flex-col">
            <CashFlowForm
              title="Entrada de Caixa"
              icon={<TrendingUp className="h-6 w-6 text-green-600" />}
              types={entryTypes}
              onSubmit={handleAddEntry}
              schema={entrySchema}
            />
            
            <CashFlowTable
              title="Histórico de Entradas"
              data={entries}
              onDelete={handleDeleteEntry}
            />
          </div>

          {/* Coluna Direita - SAÍDAS */}
          <div className="flex-1 flex flex-col">
            <CashFlowForm
              title="Saída de Caixa"
              icon={<TrendingDown className="h-6 w-6 text-red-600" />}
              types={exitTypes}
              onSubmit={handleAddExit}
              schema={exitSchema}
            />
            
            <CashFlowTable
              title="Histórico de Saídas"
              data={exits}
              onDelete={handleDeleteExit}
            />
          </div>
        </div>

        {/* Novos Inputs de Saldo */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Controles de Saldo
          </h2>
          
          <BalanceInput
            label="Saldo Inicial"
            value={saldoInicial.toString()}
            onSave={setSaldoInicial}
          />
          
          <BalanceInput
            label="Saldo Final"
            value={saldoFinal.toString()}
            onSave={setSaldoFinal}
          />
          
          <BalanceInput
            label="Aplicação Investimento"
            value={aplicacaoInvestimento.toString()}
            onSave={setAplicacaoInvestimento}
          />
        </div>

        {/* Botão de Exportação para Excel */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={exportToExcel}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-3 text-lg font-medium shadow-lg"
          >
            <Download className="h-5 w-5" />
            Exportar para Excel
          </button>
        </div>
      </div>
    </div>
  )
}
