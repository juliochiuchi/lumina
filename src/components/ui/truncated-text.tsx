import { cn } from '@/lib/utils'

interface TruncatedTextProps {
  text: string
  className?: string
}

export function TruncatedText({ text, className }: TruncatedTextProps) {
  return (
    <span title={text} className={cn('block max-w-full truncate', className)}>
      {text}
    </span>
  )
}
