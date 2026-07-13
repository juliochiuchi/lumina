import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatCpf } from "@/lib/cpf"
import type { Member } from "@/services/membersService"

interface MembersColumnsOptions {
  canManage: boolean
  onEdit: (member: Member) => void
  onDelete: (member: Member) => void
}

export function getMembersColumns({
  canManage,
  onEdit,
  onDelete,
}: MembersColumnsOptions): ColumnDef<Member>[] {
  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
    },
    {
      accessorKey: "cpf",
      header: "CPF",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.cpf ? formatCpf(row.original.cpf) : "-"}
        </span>
      ),
    },
  ]

  if (canManage) {
    columns.push({
      id: "actions",
      header: "Ações",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(row.original)}
            aria-label={`Editar ${row.original.name}`}
            title="Editar contribuinte"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(row.original)}
            aria-label={`Excluir ${row.original.name}`}
            title="Excluir contribuinte"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    })
  }

  return columns
}
