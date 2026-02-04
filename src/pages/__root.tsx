import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/Footer";

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeadContent />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster />
    </div>
  ) 
}
