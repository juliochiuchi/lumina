import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type SessionExitButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function SessionExitButton({ children, className, type = 'button', ...props }: SessionExitButtonProps) {
  return (
    <button
      type={type}
      className={cn('group flex items-center', className)}
      {...props}
    >
      <span className="h-3.5 w-3.5 rounded-full border border-[#d7473f] bg-[#ff5f57] shadow-[0_0_0_1px_rgba(0,0,0,0.2)_inset,0_6px_16px_rgba(255,95,87,0.28)] transition-transform duration-200 group-hover:scale-105" />
      <span className="pointer-events-none ml-2 rounded-full border border-rose-500/30 bg-zinc-950/95 px-3 py-1 text-xs font-medium text-rose-100 shadow-lg shadow-black/30">
        {children ?? 'Encerrar sessão'}
      </span>
    </button>
  )
}
