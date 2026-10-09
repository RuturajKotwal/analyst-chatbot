import type { UIMessage } from 'ai'

import { AssistantMessage } from '@/components/chat/AssistantMessage'
import { textFromMessage, type CitationPayload } from '@/lib/citations'
import { cn } from '@/lib/utils'

type MessageBubbleProps = {
  message: UIMessage
  selectedCitationIndex: number | null
  onSelectCitation: (citation: CitationPayload) => void
}

export function MessageBubble({
  message,
  selectedCitationIndex,
  onSelectCitation,
}: MessageBubbleProps) {
  if (message.role === 'assistant') {
    return (
      <AssistantMessage
        message={message}
        selectedCitationIndex={selectedCitationIndex}
        onSelectCitation={onSelectCitation}
      />
    )
  }

  const text = textFromMessage(message)
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'border bg-card text-card-foreground',
        )}
      >
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}
