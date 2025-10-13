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

  useEffect(() => {
    // Load from localStorage on mount (client-side only)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("headerCustomization")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setHeaderData(parsed)
        } catch (error) {
          console.error("Error loading header data:", error)
        }
      }
    }
  }, [])

  const updateHeaderData = (data: HeaderData) => {
    setHeaderData(data)
    if (typeof window !== "undefined") {
      localStorage.setItem("headerCustomization", JSON.stringify(data))
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

