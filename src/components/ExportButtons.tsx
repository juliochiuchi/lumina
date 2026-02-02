import { Download, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportButtonsProps {
  onExportExcel: () => void
  onExportDocx: () => void
  onRestart: () => void
}

export function ExportButtons({ onExportExcel, onExportDocx, onRestart }: ExportButtonsProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-center items-center">
      <Button
        onClick={onExportExcel}
        className="w-full lg:w-auto text-zinc-700 bg-zinc-200 hover:bg-zinc-100 flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <Download className="h-4 w-4" />
        Exportar para .xlsx
      </Button>

      <Button
        onClick={onExportDocx}
        className="w-full lg:w-auto text-zinc-700 bg-zinc-200 hover:bg-zinc-100 flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <Download className="h-4 w-4" />
        Exportar para .docx
      </Button>

      <Button
        onClick={onRestart}
        variant="destructive"
        className="w-full lg:w-auto text-zinc-200 bg-transparent border border-zinc-400 hover:bg-transparent hover:text-zinc-400 flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <LogOut className="h-4 w-4" />
        Encerrar Sessão
      </Button>
    </div>
  )
}