import type { ReactNode } from 'react'
import type { UIMessage } from 'ai'

import { CitationChip } from '@/components/chat/CitationChip'
import { CitationMarker } from '@/components/chat/CitationMarker'
import {
  citationByIndex,
  citationsFromMessage,
  textFromMessage,
  type CitationPayload,
} from '@/lib/citations'
import { cn } from '@/lib/utils'

type AssistantMessageProps = {
  message: UIMessage
  selectedCitationIndex: number | null
  onSelectCitation: (citation: CitationPayload) => void
}

const CITATION_MARKER_PATTERN = /\[(\d+)\]/g

function renderAnswerText(
  text: string,
  citations: CitationPayload[],
  selectedCitationIndex: number | null,
  onSelectCitation: (citation: CitationPayload) => void,
) {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = CITATION_MARKER_PATTERN.exec(text)) !== null) {
    const markerIndex = Number(match[1])
    const start = match.index

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start))
    }

    const citation = citationByIndex(citations, markerIndex)
    if (citation) {
      nodes.push(
        <CitationMarker
          key={`${start}-${markerIndex}`}
          index={markerIndex}
          selected={selectedCitationIndex === markerIndex}
          onSelect={() => onSelectCitation(citation)}
        />,
      )
    } else {
      nodes.push(match[0])
    }

    lastIndex = start + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

export function AssistantMessage({
  message,
  selectedCitationIndex,
  onSelectCitation,
}: AssistantMessageProps) {
  const text = textFromMessage(message)
  const citations = citationsFromMessage(message)
  const hasNoEvidence = text.length > 0 && citations.length === 0

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          'max-w-[85%] rounded-2xl border bg-card px-4 py-3 text-sm leading-relaxed text-card-foreground',
        )}
      >
        {text ? (
          <p className="whitespace-pre-wrap">
            {renderAnswerText(text, citations, selectedCitationIndex, onSelectCitation)}
          </p>
        ) : null}

        {hasNoEvidence ? (
          <p className="mt-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            No filing evidence found for this answer.
          </p>
        ) : null}

        {citations.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
            {citations.map((citation) => (
              <CitationChip
                key={`${citation.chunkId}-${citation.citationIndex}`}
                citation={citation}
                selected={selectedCitationIndex === citation.citationIndex}
                onSelect={onSelectCitation}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
