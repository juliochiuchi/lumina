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
    <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/55 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3 sm:px-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="divide-y divide-zinc-800/50 px-4 sm:px-5">
        <div className="flex items-center gap-3 py-2.5">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <div className="flex items-center gap-3 py-2.5">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-28 rounded-md" />
        </div>
        <div className="flex items-center gap-3 py-2.5">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
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
