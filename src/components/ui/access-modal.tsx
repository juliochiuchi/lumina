import { ArrowRight, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/use-auth'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { GlobalLoading } from '@/components/ui/global-loading'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
})

type FormValues = z.infer<typeof schema>

export function AccessModal() {
  const { requestAccess } = useAuth()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: FormValues) => {
    await requestAccess(data.email)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <GlobalLoading
        visible={form.formState.isSubmitting}
        text="Enviando link de confirmação..."
        className="z-[60]"
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.22),transparent_58%)]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.04),transparent_18%,transparent_82%,rgba(34,197,94,0.06))]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full max-w-md">
          <div className="rounded-[28px] border border-white/10 bg-zinc-900/75 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10">
                <img
                  src="/logo-ipim-verde.png"
                  alt="Logo do projeto IPIM"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-emerald-300/90">
                Plataforma Financeira
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[0.3em] text-white">
                LUMINA
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">
                Entre com seu e-mail para receber o link de acesso.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-200">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@instituicao.org"
                    {...form.register('email')}
                    autoFocus
                    className="h-12 rounded-xl border-white/10 bg-zinc-950/60 pl-11 pr-4 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-emerald-300"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-12 w-full rounded-xl bg-emerald-500 text-zinc-950 shadow-[0_14px_30px_rgba(34,197,94,0.25)] transition hover:bg-emerald-400"
              >
                {form.formState.isSubmitting ? 'Enviando...' : 'Receber acesso'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
              Use um e-mail autorizado.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
