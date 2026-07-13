import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { Plus, Users } from "lucide-react"
import { toast } from "sonner"

import { MemberFormModal, type MemberFormPayload } from "@/components/members/MemberFormModal"
import { getMembersColumns } from "@/components/members/members-columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { GlobalLoading } from "@/components/ui/global-loading"
import { useAuth } from "@/contexts/use-auth"
import { membersService, type Member } from "@/services/membersService"

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message
  }

  return null
}

export const Route = createFileRoute("/_app/contributors")({
  component: ContributorsPage,
})

function ContributorsPage() {
  const { isAdmin } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const columns = useMemo(
    () =>
      getMembersColumns({
        canManage: isAdmin,
        onEdit: (member) => {
          if (!isAdmin) return
          setSelectedMember(member)
          setIsModalOpen(true)
        },
        onDelete: (member) => {
          if (!isAdmin) return
          setMemberToDelete(member)
        },
      }),
    [isAdmin],
  )

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)

      try {
        const data = await membersService.getAll()
        setMembers(data)
      } catch (error) {
        console.error(error)
        toast.error(getErrorMessage(error) ?? "Não foi possível carregar os contribuintes")
      } finally {
        setLoading(false)
      }
    }

    void fetchMembers()
  }, [])

  const handleOpenCreateModal = () => {
    if (!isAdmin) return
    setSelectedMember(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (isSubmitting) return
    setIsModalOpen(false)
    setSelectedMember(null)
  }

  const handleSubmitMember = async (payload: MemberFormPayload) => {
    if (!isAdmin) return

    setIsSubmitting(true)

    try {
      if (selectedMember) {
        const updatedMember = await membersService.update(selectedMember.id, payload)
        setMembers((current) =>
          current
            .map((member) => (member.id === updatedMember.id ? updatedMember : member))
            .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"))
        )
        toast.success("Contribuinte atualizado com sucesso")
      } else {
        const newMember = await membersService.create(payload)
        setMembers((current) =>
          [...current, newMember].sort((left, right) => left.name.localeCompare(right.name, "pt-BR"))
        )
        toast.success("Contribuinte cadastrado com sucesso")
      }

      setIsModalOpen(false)
      setSelectedMember(null)
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error) ?? "Não foi possível salvar o contribuinte")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMember = async () => {
    if (!isAdmin || !memberToDelete) return

    setIsDeleting(true)

    try {
      await membersService.delete(memberToDelete.id)
      setMembers((current) => current.filter((member) => member.id !== memberToDelete.id))
      toast.success("Contribuinte excluído com sucesso")
      setMemberToDelete(null)
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error) ?? "Não foi possível excluir o contribuinte")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 text-foreground sm:p-6">
      <GlobalLoading visible={loading} text="Carregando contribuintes..." />

      <MemberFormModal
        isOpen={isModalOpen}
        member={selectedMember}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={handleSubmitMember}
      />

      <ConfirmationModal
        isOpen={memberToDelete !== null}
        onClose={() => {
          if (!isDeleting) setMemberToDelete(null)
        }}
        onConfirm={handleDeleteMember}
        title="Excluir contribuinte"
        description={
          memberToDelete
            ? `Tem certeza que deseja excluir ${memberToDelete.name}? Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir este contribuinte?"
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />

      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Contribuintes</h1>
                <p className="text-sm text-muted-foreground">
                  {isAdmin
                    ? "Gerencie os contribuintes cadastrados para manter a base atualizada."
                    : "Consulte os contribuintes cadastrados na base da igreja."}
                </p>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo contribuinte
            </Button>
          ) : null}
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl text-foreground">Lista de contribuintes</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Consulte, cadastre, edite ou remova registros da tabela de contribuintes."
                  : "Consulte a listagem de contribuintes cadastrados."}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={members}
              searchColumn="name"
              searchPlaceholder="Buscar contribuinte por nome..."
              emptyMessage="Nenhum contribuinte cadastrado até o momento."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
