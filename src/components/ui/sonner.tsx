import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-800 group-[.toaster]:text-white group-[.toaster]:border-zinc-700 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-zinc-300",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-zinc-800 group-[.toast]:hover:bg-zinc-100",
          cancelButton:
            "group-[.toast]:bg-zinc-700 group-[.toast]:text-zinc-300 group-[.toast]:hover:bg-zinc-600",
          success: "group-[.toast]:bg-zinc-800 group-[.toast]:text-white group-[.toast]:border-zinc-700",
          error: "group-[.toast]:bg-zinc-800 group-[.toast]:text-white group-[.toast]:border-zinc-700",
          info: "group-[.toast]:bg-zinc-800 group-[.toast]:text-white group-[.toast]:border-zinc-700",
          warning: "group-[.toast]:bg-zinc-800 group-[.toast]:text-white group-[.toast]:border-zinc-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
