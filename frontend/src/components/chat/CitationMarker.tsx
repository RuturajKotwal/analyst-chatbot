import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CitationMarkerProps = {
  index: number
  selected?: boolean
  onSelect: (index: number) => void
}

export function CitationMarker({ index, selected, onSelect }: CitationMarkerProps) {
  return (
    <Button
      type="button"
      variant="link"
      size="xs"
      className={cn(
        'h-auto min-w-0 px-0.5 align-super text-xs font-semibold',
        selected ? 'text-primary' : 'text-primary/80',
      )}
      onClick={() => onSelect(index)}
    >
      [{index}]
    </Button>
  )
}
