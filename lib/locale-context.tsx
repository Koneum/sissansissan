"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Locale, useTranslations } from "./i18n"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof useTranslations>
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr") // Français par défaut
  const t = useTranslations(locale)

  useEffect(() => {
    const storedLocale = localStorage.getItem("cozy_locale") as Locale
    if (storedLocale && (storedLocale === "en" || storedLocale === "fr")) {
      setLocaleState(storedLocale)
    } else {
      // Si pas de langue stockée, utiliser français par défaut
      setLocaleState("fr")
      localStorage.setItem("cozy_locale", "fr")
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("cozy_locale", newLocale)
  }

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
