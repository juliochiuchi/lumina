interface TypeSummaryProps {
  title: string
  data: Array<{ id: string; description: string; type: string; amount: number; date: string }>
  icon: React.ReactNode
}

export function TypeSummary({ title, data, icon }: TypeSummaryProps) {
  // Calcular totais por categoria
  const typeTotals = data.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = 0
    }
    acc[item.type] += item.amount
    return acc
  }, {} as Record<string, number>)

  // Ordenar por valor (maior para menor)
  const sortedTypes = Object.entries(typeTotals)
    .sort(([,a], [,b]) => b - a)

  if (sortedTypes.length === 0) {
    return (
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          {icon}
          <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        </div>
        <p className="text-zinc-400 text-center py-4">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {sortedTypes.map(([type, total]) => (
          <div key={type} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-b-0">
            <span className="text-zinc-300">{type}</span>
            <span className="font-medium text-zinc-100">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(total)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-zinc-700">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-zinc-100">Total:</span>
          <span className="font-bold text-lg text-zinc-100">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(sortedTypes.reduce((sum, [, total]) => sum + total, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}