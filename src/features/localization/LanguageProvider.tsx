'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/storage'

import ar from './dictionaries/ar'
import en from './dictionaries/en'

export type Language = 'en' | 'ar'
export type Direction = 'ltr' | 'rtl'

interface LanguageContextType {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const dictionaries = { en, ar } as const
const storageKey = 'souq-language'

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr'

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    safeLocalStorageSet(storageKey, lang)
  }

  useEffect(() => {
    const saved = safeLocalStorageGet(storageKey)
    if (saved === 'en' || saved === 'ar') {
      setLanguage(saved)
      return
    }

    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
  }, [])

  const value = useMemo(
    () => ({
      language,
      direction,
      setLanguage,
      t: (key: string) => dictionaries[language][key as keyof (typeof dictionaries)[typeof language]] ?? key,
    }),
    [direction, language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
