import { Link } from 'react-router-dom'

import { classifyChatError } from '@/lib/chat-errors'

type ChatErrorProps = {
  error: Error
}

export function ChatError({ error }: ChatErrorProps) {
  const classified = classifyChatError(error)

  return (
    <div
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      <p className="font-medium">{classified.title}</p>
      <p className="mt-1 text-destructive/90">{classified.message}</p>
      {classified.showLoginLink ? (
        <Link to="/login" className="mt-2 inline-block font-medium underline underline-offset-4">
          Sign in again
        </Link>
      ) : null}
    </div>
  )
}
