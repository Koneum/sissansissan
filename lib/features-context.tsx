"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface FeatureItem {
  icon: string
  title: string
  description: string
  gradient: string
}

export interface FeaturesData {
  enabled: boolean
  features: FeatureItem[]
}

const defaultFeaturesData: FeaturesData = {
  enabled: true,
  features: [
    {
      icon: "Truck",
      title: "Livraison Gratuite",
      description: "Pour toute commande dès 50 000 FCFA",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: "RotateCcw",
      title: "Retours Faciles",
      description: "Retour gratuit sous 14 jours",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: "Shield",
      title: "Paiement Sécurisé",
      description: "Transactions 100% sécurisées",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: "Headphones",
      title: "Support 24/7",
      description: "Assistance disponible à tout moment",
      gradient: "from-orange-500 to-red-500",
    },
  ],
}

interface FeaturesContextType {
  featuresData: FeaturesData
  updateFeaturesData: (data: FeaturesData) => void
  isLoading: boolean
}

const FeaturesContext = createContext<FeaturesContextType | undefined>(undefined)

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [featuresData, setFeaturesData] = useState<FeaturesData>(defaultFeaturesData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFeaturesData()
  }, [])

  const fetchFeaturesData = async () => {
    try {
      const response = await fetch("/api/settings/features")
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setFeaturesData({ ...defaultFeaturesData, ...result.data })
        }
      }
    } catch (error) {
      console.error("Error loading features data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFeaturesData = async (data: FeaturesData) => {
    setFeaturesData(data)

    try {
      await fetch("/api/settings/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error("Error saving features data:", error)
    }
  }

  return (
    <FeaturesContext.Provider value={{ featuresData, updateFeaturesData, isLoading }}>
      {children}
    </FeaturesContext.Provider>
  )
}

export function useFeatures() {
  const context = useContext(FeaturesContext)
  if (context === undefined) {
    throw new Error("useFeatures must be used within a FeaturesProvider")
  }
  return context
}
