"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface PromoBanner {
  id: string
  title: string
  subtitle: string
  description: string
  discount: string
  image: string
  buttonText: string
  buttonLink: string
  enabled: boolean
}

interface PromoContextType {
  promoBanners: PromoBanner[]
  loading: boolean
  refreshPromoBanners: () => Promise<void>
}

const PromoContext = createContext<PromoContextType | undefined>(undefined)

export function PromoProvider({ children }: { children: ReactNode }) {
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPromoBanners = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/settings/promo-banners")
      if (response.ok) {
        const data = await response.json()
        setPromoBanners(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching promo banners:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromoBanners()
  }, [])

  return (
    <PromoContext.Provider
      value={{
        promoBanners,
        loading,
        refreshPromoBanners: fetchPromoBanners,
      }}
    >
      {children}
    </PromoContext.Provider>
  )
}

export function usePromo() {
  const context = useContext(PromoContext)
  if (context === undefined) {
    throw new Error("usePromo must be used within a PromoProvider")
  }
  return context
}



