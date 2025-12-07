"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface NewsletterData {
  enabled: boolean
  title: string
  subtitle: string
  buttonText: string
  benefits: {
    icon: string
    text: string
  }[]
  backgroundColor: string
  accentColor: string
}

const defaultNewsletterData: NewsletterData = {
  enabled: true,
  title: "Restez connecté aux tendances",
  subtitle: "Inscrivez-vous pour recevoir en avant-première nos offres exclusives et codes de réduction.",
  buttonText: "S'inscrire maintenant",
  benefits: [
    { icon: "Gift", text: "Offres exclusives" },
    { icon: "Bell", text: "Alertes nouveautés" },
    { icon: "Sparkles", text: "Codes promo VIP" },
  ],
  backgroundColor: "#1e1b4b", // slate-900 with purple tint
  accentColor: "#f97316", // orange-500
}

interface NewsletterContextType {
  newsletterData: NewsletterData
  updateNewsletterData: (data: NewsletterData) => void
  isLoading: boolean
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined)

export function NewsletterProvider({ children }: { children: ReactNode }) {
  const [newsletterData, setNewsletterData] = useState<NewsletterData>(defaultNewsletterData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNewsletterData()
  }, [])

  const fetchNewsletterData = async () => {
    try {
      const response = await fetch("/api/settings/newsletter")
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setNewsletterData({ ...defaultNewsletterData, ...result.data })
        }
      }
    } catch (error) {
      console.error("Error loading newsletter data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateNewsletterData = async (data: NewsletterData) => {
    setNewsletterData(data)

    try {
      await fetch("/api/settings/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error("Error saving newsletter data:", error)
    }
  }

  return (
    <NewsletterContext.Provider value={{ newsletterData, updateNewsletterData, isLoading }}>
      {children}
    </NewsletterContext.Provider>
  )
}

export function useNewsletter() {
  const context = useContext(NewsletterContext)
  if (context === undefined) {
    throw new Error("useNewsletter must be used within a NewsletterProvider")
  }
  return context
}
