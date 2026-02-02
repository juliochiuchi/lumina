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
          "bg-input border-border text-foreground",
          error && "border-destructive"
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {options.map((option) => (
            <SelectItem 
              key={option} 
              value={option}
              className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
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