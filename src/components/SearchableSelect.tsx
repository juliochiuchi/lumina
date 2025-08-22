import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SearchableSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

export function SearchableSelect({ options, value, onChange, placeholder, error }: SearchableSelectProps) {
  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(
          "bg-zinc-800 border-zinc-700 text-zinc-100",
          error && "border-red-500"
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          {options.map((option) => (
            <SelectItem 
              key={option} 
              value={option}
              className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}