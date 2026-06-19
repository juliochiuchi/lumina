import { z } from 'zod'
import { CashFlowForm } from '@/components/CashFlowForm'
import { CashFlowTable } from '@/components/CashFlowTable'
import { Skeleton } from '@/components/ui/skeleton'
import type { CashFlowFormData, CashFlowRecord, CashFlowFormMode } from '@/types/cash-flow'

interface CashFlowSectionProps<TSchema extends z.ZodTypeAny> {
  formTitle: string
  tableTitle: string
  icon: React.ReactNode
  types: string[]
  onSubmit: (data: z.infer<TSchema>) => Promise<boolean> | boolean
  schema: TSchema
  mode?: CashFlowFormMode
  initialData?: CashFlowFormData | null
  onCancelEdit?: () => void
  data: CashFlowRecord[]
  isLoading: boolean
  canManage: boolean
  onDelete?: (item: CashFlowRecord) => void
  onEdit?: (item: CashFlowRecord) => void
  variant?: 'entry' | 'exit'
}

function CashFlowSectionLoading() {
  return (
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
  )
}

export function CashFlowSection<TSchema extends z.ZodTypeAny>({
  formTitle,
  tableTitle,
  icon,
  types,
  onSubmit,
  schema,
  mode = 'create',
  initialData = null,
  onCancelEdit,
  data,
  isLoading,
  canManage,
  onDelete,
  onEdit,
  variant = 'entry',
}: CashFlowSectionProps<TSchema>) {
  return (
    <div className="flex-1 min-w-0 space-y-6">
      {canManage ? (
        <CashFlowForm
          title={formTitle}
          icon={icon}
          types={types}
          onSubmit={onSubmit}
          schema={schema}
          mode={mode}
          initialData={initialData}
          onCancelEdit={onCancelEdit}
        />
      ) : null}

      {isLoading ? (
        <CashFlowSectionLoading />
      ) : (
        <CashFlowTable
          title={tableTitle}
          data={data}
          onDelete={onDelete}
          onEdit={onEdit}
          canDelete={canManage}
          canEdit={canManage}
          variant={variant}
        />
      )}
    </div>
  )
}
