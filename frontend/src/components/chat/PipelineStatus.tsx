import type { ChatStatus } from 'ai'

import { PIPELINE_STEPS, type PipelineStatus as PipelineStatusState } from '@/lib/citations'
import { cn } from '@/lib/utils'

type PipelineStatusProps = {
  status: ChatStatus
  pipelineStatus: PipelineStatusState | null
}

function stepIndex(stage: PipelineStatusState['stage']): number {
  return PIPELINE_STEPS.findIndex((step) => step.stage === stage)
}

export function PipelineStatus({ status, pipelineStatus }: PipelineStatusProps) {
  if (status !== 'submitted' && status !== 'streaming') {
    return null
  }

  const message =
    status === 'submitted'
      ? 'Sending…'
      : (pipelineStatus?.message ?? 'Researching filings…')

  const activeIndex = pipelineStatus ? stepIndex(pipelineStatus.stage) : 0

  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <span>{message}</span>
      </div>

      {status === 'streaming' ? (
        <div className="mt-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {PIPELINE_STEPS.map((step, index) => {
            const isActive = index === activeIndex
            const isComplete = index < activeIndex

            return (
              <span key={step.stage} className="flex items-center gap-1">
                {index > 0 ? <span className="text-border">→</span> : null}
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5',
                    isActive && 'bg-primary/10 font-medium text-primary',
                    isComplete && 'text-foreground',
                    !isActive && !isComplete && 'text-muted-foreground/70',
                  )}
                >
                  {step.label}
                </span>
              </span>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
