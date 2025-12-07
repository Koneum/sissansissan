"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface HeaderData {
  topBannerText: string
  topBannerEnabled: boolean
  logoUrl: string
  emailLogoUrl: string
  navigation: {
    home: boolean
    shop: boolean
    pages: boolean
    blog: boolean
    contact: boolean
  }
}

const defaultHeaderData: HeaderData = {
  topBannerText: "Get free delivery on orders over $80",
  topBannerEnabled: true,
  logoUrl: "/logo.png",
  emailLogoUrl: "/logo.png",
  navigation: {
    home: true,
    shop: true,
    pages: true,
    blog: true,
    contact: true
  }
}

interface HeaderContextType {
  headerData: HeaderData
  updateHeaderData: (data: HeaderData) => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerData, setHeaderData] = useState<HeaderData>(defaultHeaderData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeaderData()
  }, [])

  const fetchHeaderData = async () => {
    try {
      const response = await fetch("/api/settings/header")
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setHeaderData(result.data)
        }
      }
    } catch (error) {
      console.error("Error loading header data:", error)
      // Fallback to localStorage for backward compatibility
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("headerCustomization")
        if (stored) {
          try {
            setHeaderData(JSON.parse(stored))
          } catch (e) {
            console.error("Error parsing localStorage:", e)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const updateHeaderData = async (data: HeaderData) => {
    setHeaderData(data)
    
    // Save to localStorage as cache
    if (typeof window !== "undefined") {
      localStorage.setItem("headerCustomization", JSON.stringify(data))
    }

    // Save to database via API
    try {
      await fetch("/api/settings/header", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error("Error saving header data to database:", error)
    }
  }

  return (
    <HeaderContext.Provider value={{ headerData, updateHeaderData }}>
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeader() {
  const context = useContext(HeaderContext)
  if (context === undefined) {
    throw new Error("useHeader must be used within a HeaderProvider")
  }
  return context
}




