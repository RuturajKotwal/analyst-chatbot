import { Button } from '@/components/ui/button'
import { citationLabel, type CitationPayload } from '@/lib/citations'
import { cn } from '@/lib/utils'

type CitationChipProps = {
  citation: CitationPayload
  selected?: boolean
  onSelect: (citation: CitationPayload) => void
}

export function CitationChip({ citation, selected, onSelect }: CitationChipProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      className={cn(
        'h-auto max-w-full py-1 text-left font-normal',
        selected && 'border-primary bg-primary/5 text-foreground',
      )}
      onClick={() => onSelect(citation)}
    >
      <span className="mr-1 font-medium text-primary">[{citation.citationIndex}]</span>
      <span className="truncate">{citationLabel(citation)}</span>
    </Button>
  )
}
