import { Link } from "@tanstack/react-router"
import {
  BarChart3,
  FileDown,
  FileUp,
  FileText,
  Gem,
  LogOut,
  Receipt,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Users,
  Wallet,
} from "lucide-react"

import { useAuth } from "@/contexts/use-auth"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"

export function AppMenubar() {
  const { logout } = useAuth()

  return (
    <div className="p-4">
      <Menubar className="flex h-auto items-center justify-between rounded-full border bg-background px-3 py-1.5 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 pl-2 pr-4 text-sm font-semibold">
            <Gem className="h-4 w-4" />
            Lumina
          </Link>

          <div className="flex items-center gap-1">
            <MenubarMenu>
              <MenubarTrigger className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Financeiro
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Fluxo de caixa
                  </Link>
                </MenubarItem>
                <MenubarItem asChild>
                  <Link to="/accountability" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Prestação de contas
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <Link
                    to="https://drive.google.com/drive/u/1/folders/15KgESYnFf3L28pjdFqKiNAxu7A9rFYE9"
                    className="flex items-center gap-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Receipt className="h-4 w-4" />
                    Recibos
                  </Link>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem disabled className="gap-2">
                  <FileUp className="h-4 w-4" />
                  Importar
                </MenubarItem>
                <MenubarItem disabled className="gap-2">
                  <FileDown className="h-4 w-4" />
                  Exportar
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Configurações
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem disabled className="gap-2 disabled:cursor-not-allowed">
                  <Settings className="h-4 w-4" />
                  Preferências
                </MenubarItem>
                <MenubarItem disabled className="gap-2 disabled:cursor-not-allowed">
                  <Users className="h-4 w-4" />
                  Equipe
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </div>
        </div>

        <MenubarMenu>
          <MenubarTrigger className="flex h-9 w-9 items-center justify-center rounded-full bg-muted p-0 hover:bg-accent data-[state=open]:bg-accent">
            <User className="h-5 w-5 text-muted-foreground" />
          </MenubarTrigger>
          <MenubarContent align="end" className="min-w-48">
            <MenubarItem
              className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
              onSelect={() => {
                void logout()
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}
