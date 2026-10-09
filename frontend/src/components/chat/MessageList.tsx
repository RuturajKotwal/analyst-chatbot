import { useEffect, useRef } from 'react'
import type { ChatStatus, UIMessage } from 'ai'

import { MessageBubble } from '@/components/chat/MessageBubble'
import { PipelineStatus } from '@/components/chat/PipelineStatus'
import type { CitationPayload, PipelineStatus as PipelineStatusState } from '@/lib/citations'
import { ScrollArea } from '@/components/ui/scroll-area'

const EXAMPLE_QUESTIONS = [
  'How has Apple’s revenue mix shifted over the last three fiscal years?',
  'What did Microsoft disclose about Azure growth in its latest 10-K?',
]

type MessageListProps = {
  messages: UIMessage[]
  status: ChatStatus
  pipelineStatus: PipelineStatusState | null
  selectedCitationIndex: number | null
  onSelectCitation: (citation: CitationPayload) => void
}

export function MessageList({
  messages,
  status,
  pipelineStatus,
  selectedCitationIndex,
  onSelectCitation,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status, pipelineStatus])

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-6">
        {messages.length === 0 ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Ask a question about SEC filings to get started.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Try asking
              </p>
              {EXAMPLE_QUESTIONS.map((question) => (
                <p
                  key={question}
                  className="rounded-lg border bg-muted/30 px-3 py-2 text-left text-xs text-muted-foreground"
                >
                  {question}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            selectedCitationIndex={selectedCitationIndex}
            onSelectCitation={onSelectCitation}
          />
        ))}

        <PipelineStatus status={status} pipelineStatus={pipelineStatus} />
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
