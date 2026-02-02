import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type GlobalLoadingProps = {
  visible: boolean
  text?: string
  className?: string
}

export function GlobalLoading({ visible, text, className }: GlobalLoadingProps) {
  if (!visible) return null
  return (
    <div className={cn('fixed inset-0 z-50 bg-black/80 flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 text-zinc-100 animate-spin" />
        {text && <span className="text-zinc-100 text-sm">{text}</span>}
      </div>
    </div>
  )
}
