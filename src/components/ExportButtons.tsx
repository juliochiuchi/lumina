import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ExportButtonsProps {
  onExportExcel: () => void
  onExportDocx: () => void
  className?: string
}

export function ExportButtons({ onExportExcel, onExportDocx, className }: ExportButtonsProps) {
  return (
    <div className={cn('grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1', className)}>
      <Button
        onClick={onExportExcel}
        variant="outline"
        className="h-auto min-h-11 w-full justify-start rounded-lg border-zinc-800/80 bg-zinc-950/50 px-4 py-3 text-left whitespace-normal text-zinc-100 shadow-none hover:bg-zinc-900/70 hover:text-white"
      >
        <Download className="h-4 w-4" />
        <span className="min-w-0 break-words">
          Exportar para .xlsx <span className="text-[.8rem] font-light italic text-muted-foreground">(excel)</span>
        </span>
      </Button>

      <Button
        onClick={onExportDocx}
        variant="outline"
        className="h-auto min-h-11 w-full justify-start rounded-lg border-zinc-800/80 bg-zinc-950/50 px-4 py-3 text-left whitespace-normal text-zinc-100 shadow-none hover:bg-zinc-900/70 hover:text-white"
      >
        <Download className="h-4 w-4" />
        <span className="min-w-0 break-words">
          Exportar para .docx <span className="text-[.8rem] font-light italic text-muted-foreground">(word)</span>
        </span>
      </Button>
    </div>
  )
}
