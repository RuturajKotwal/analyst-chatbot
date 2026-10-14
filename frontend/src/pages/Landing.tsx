import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export function Landing() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isStartingDemo, setIsStartingDemo] = useState(false)

  async function startDemo() {
    setError(null)
    setIsStartingDemo(true)

    const { data, error: signInError } = await supabase.auth.signInAnonymously()
    setIsStartingDemo(false)

    if (signInError || !data.session) {
      setError(signInError?.message ?? 'Could not start the demo. Please try again.')
      return
    }

    navigate('/chats')
  }

  return (
    <main className="flex min-h-svh flex-col bg-muted/30 px-6 py-8">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Logo />
        <Button asChild variant="ghost">
          <Link to="/login">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="mb-4 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          SEC filing research assistant
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Ask questions about SEC filings. Inspect every source.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          Document Copilot searches a curated SEC filing corpus and returns grounded answers with
          citations you can open and verify.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" onClick={() => void startDemo()} disabled={isStartingDemo}>
            {isStartingDemo ? 'Starting demo…' : 'Try demo'}
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-12 grid w-full gap-3 text-left sm:grid-cols-3">
          {[
            'How did NVIDIA describe data center demand in fiscal 2024?',
            'Compare Apple’s revenue mix across two fiscal years.',
            'What supply chain risks did Amazon disclose?',
          ].map((question) => (
            <p key={question} className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
              {question}
            </p>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Demo corpus: 10-K filings from Apple, Amazon, Alphabet, Microsoft, and NVIDIA for fiscal
          years 2021–2025.
        </p>
      </section>
    </main>
  )
}
