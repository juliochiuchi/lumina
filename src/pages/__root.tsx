import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/use-auth";
import { AccessModal } from "@/components/ui/access-modal";
import { AppMenubar } from "@/components/AppMenubar";

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <HeadContent />
        <AccessModal />
        <Toaster />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeadContent />
      <AppMenubar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster />
    </div>
  ) 
}
