import { Download, FileText, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportButtonsProps {
  onExportExcel: () => void
  onExportDocx: () => void
  onRestart: () => void
}

export function ExportButtons({ onExportExcel, onExportDocx, onRestart }: ExportButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
      <Button
        onClick={onExportExcel}
        className="w-full sm:w-auto text-zinc-700 bg-zinc-200 hover:bg-zinc-100 flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <Download className="h-4 w-4" />
        Exportar para Excel
      </Button>
      
      <Button
        onClick={onExportDocx}
        className="w-full sm:w-auto text-zinc-700 bg-zinc-200 hover:bg-zinc-100 flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <FileText className="h-4 w-4" />
        Exportar para Docx
      </Button>
      
      <Button
        onClick={onRestart}
        variant="destructive"
        className="w-full sm:w-auto text-zinc-700 bg-zinc-200 hover:bg-zinc-100 flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <RefreshCcw className="h-4 w-4" />
        Restart
      </Button>
    </div>
  )
}