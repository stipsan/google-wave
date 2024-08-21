'use client'

import {useEffect, useState} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {type LiveEventMessage, type LiveEventRestart} from 'next-sanity'
import {useEffectEvent} from 'use-effect-event'

import {client} from '@/sanity/lib/client'

const searchParamKey = 'lastLiveEventId'

/**
 * @alpha this API is experimental and may change or even be removed
 */
export default function LiveSubscription(): null {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    throw error
  }

  const handleEvent = useEffectEvent((event: LiveEventMessage | LiveEventRestart) => {
    const params = new URLSearchParams(searchParams.toString())
    if (event.type === 'restart') {
      params.delete(searchParamKey)
    }
    if (event.type === 'message') {
      params.set(searchParamKey, event.id)
    }
    router.replace(`${pathname}?${params}`, {scroll: false})
  })
  useEffect(() => {
    const subscription = client.live.events().subscribe({
      next: handleEvent,
      error: setError,
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [handleEvent, setError])

  return null
}
