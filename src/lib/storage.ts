'use client'

export function isBrowser() {
  return typeof window !== 'undefined'
}

export function safeLocalStorageGet(key: string) {
  if (!isBrowser()) return null
  return window.localStorage.getItem(key)
}

export function safeLocalStorageSet(key: string, value: string) {
  if (!isBrowser()) return
  window.localStorage.setItem(key, value)
}

export function safeLocalStorageRemove(key: string) {
  if (!isBrowser()) return
  window.localStorage.removeItem(key)
}
