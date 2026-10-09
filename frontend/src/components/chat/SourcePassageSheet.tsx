import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  citationHeader,
  citationSubtitle,
  type CitationPayload,
} from '@/lib/citations'

type SourcePassageSheetProps = {
  citation: CitationPayload | null
  onOpenChange: (open: boolean) => void
}

export function SourcePassageSheet({ citation, onOpenChange }: SourcePassageSheetProps) {
  const subtitle = citation ? citationSubtitle(citation) : null

  return (
    <Sheet open={citation !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {citation ? (
          <>
            <SheetHeader>
              <SheetTitle>{citationHeader(citation)}</SheetTitle>
              {subtitle ? <SheetDescription>{subtitle}</SheetDescription> : null}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4">
              <blockquote className="rounded-lg border bg-muted/30 px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                {citation.excerpt}
              </blockquote>
            </div>

            <SheetFooter>
              <p className="text-xs text-muted-foreground">
                Citation [{citation.citationIndex}] — verbatim excerpt from the filing
              </p>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
