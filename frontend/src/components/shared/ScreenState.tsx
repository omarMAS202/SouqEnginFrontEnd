'use client'

import { AlertCircle, Inbox, Loader2 } from 'lucide-react'

import { cn } from '@/utils/cn'

export function LoadingState({
  message = 'Loading...',
  centered = true,
}: {
  message?: string
  centered?: boolean
}) {
  return (
    <div className={cn('flex gap-3 text-muted-foreground', centered && 'min-h-[240px] items-center justify-center')}>
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>{message}</span>
    </div>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 text-center">
      <div className="rounded-full bg-muted p-3">
        <Inbox className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function ErrorState({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}
