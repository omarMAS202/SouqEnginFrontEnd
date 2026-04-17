'use client'

import { useEffect } from 'react'

import { useAuth } from '../hooks/useAuth'

export function AuthBootstrap() {
  const { bootstrapSession, hydrated } = useAuth()

  useEffect(() => {
    if (hydrated) return
    void bootstrapSession()
  }, [bootstrapSession, hydrated])

  return null
}
