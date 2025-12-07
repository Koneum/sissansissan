"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface SEOData {
  homeTitle: string
  homeDescription: string
  homeKeywords: string
  siteName: string
  defaultOGImage: string
  twitterHandle: string
  googleAnalyticsId: string
  facebookPixelId: string
}

const defaultSEOData: SEOData = {
  homeTitle: "Sissan - Premium Electronics & Tech Store",
  homeDescription: "Shop the latest electronics, smartphones, laptops, and tech accessories at the best prices",
  homeKeywords: "electronics, smartphones, laptops, tech, accessories, online shopping",
  siteName: "Sissan",
  defaultOGImage: "/logo.png",
  twitterHandle: "@sissan",
  googleAnalyticsId: "",
  facebookPixelId: ""
}

interface SEOContextType {
  seoData: SEOData
  updateSEOData: (data: SEOData) => void
}

const SEOContext = createContext<SEOContextType | undefined>(undefined)

export function SEOProvider({ children }: { children: ReactNode }) {
  const [seoData, setSEOData] = useState<SEOData>(defaultSEOData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSEOData()
  }, [])

  const fetchSEOData = async () => {
    try {
      const response = await fetch("/api/settings/seo")
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setSEOData(result.data)
        }
      }
    } catch (error) {
      console.error("Error loading SEO data:", error)
      // Fallback to localStorage for backward compatibility
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("seoCustomization")
        if (stored) {
          try {
            setSEOData(JSON.parse(stored))
          } catch (e) {
            console.error("Error parsing localStorage:", e)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const updateSEOData = async (data: SEOData) => {
    setSEOData(data)
    
    // Save to localStorage as cache
    if (typeof window !== "undefined") {
      localStorage.setItem("seoCustomization", JSON.stringify(data))
    }

    // Save to database via API
    try {
      await fetch("/api/settings/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error("Error saving SEO data to database:", error)
    }
  }

  return (
    <SEOContext.Provider value={{ seoData, updateSEOData }}>
      {children}
    </SEOContext.Provider>
  )
}

export function useSEO() {
  const context = useContext(SEOContext)
  if (context === undefined) {
    throw new Error("useSEO must be used within a SEOProvider")
  }
  return context
}




