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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("seoCustomization")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setSEOData(parsed)
        } catch (error) {
          console.error("Error loading SEO data:", error)
        }
      }
    }
  }, [])

  const updateSEOData = (data: SEOData) => {
    setSEOData(data)
    if (typeof window !== "undefined") {
      localStorage.setItem("seoCustomization", JSON.stringify(data))
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

