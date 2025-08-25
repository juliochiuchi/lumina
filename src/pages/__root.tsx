import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
      <Toaster />
    </>
  ) 
}
