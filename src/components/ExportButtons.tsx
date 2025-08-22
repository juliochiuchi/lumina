import { Download, FileText, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportButtonsProps {
  onExportExcel: () => void
  onExportDocx: () => void
  onRestart: () => void
}

export function ExportButtons({ onExportExcel, onExportDocx, onRestart }: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <Button
        onClick={onExportExcel}
        className="text-zinc-700 bg-zinc-200 hover:bg-zinc-100 flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Exportar para Excel
      </Button>
      
      <Button
        onClick={onExportDocx}
        className="text-zinc-700 bg-zinc-200 hover:bg-zinc-100 flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Exportar para Docx
      </Button>
      
      <Button
        onClick={onRestart}
        variant="destructive"
        className="text-zinc-700 bg-zinc-200 hover:bg-zinc-100 flex items-center gap-2"
      >
        <RefreshCcw className="h-4 w-4" />
        Restart
      </Button>
    </div>
  )
}