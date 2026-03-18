import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./route-tree.gen"
import { AuthProvider } from "@/contexts/AuthContext";
// import { ThemeProvider } from "@/hooks/use-theme"

const router = createRouter({ routeTree })

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
