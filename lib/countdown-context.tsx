"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CountdownData {
  enabled: boolean
  title: string
  endDate: string
  backgroundColor: string
  textColor: string
  image: string
}

const defaultCountdownData: CountdownData = {
  enabled: true,
  title: "FLASH SALE ENDS IN",
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  backgroundColor: "#4F46E5",
  textColor: "#FFFFFF",
  image: "/black-bluetooth-speaker-with-blue-accent.jpg"
}

interface CountdownContextType {
  countdownData: CountdownData
  updateCountdownData: (data: CountdownData) => void
}

const CountdownContext = createContext<CountdownContextType | undefined>(undefined)

export function CountdownProvider({ children }: { children: ReactNode }) {
  const [countdownData, setCountdownData] = useState<CountdownData>(defaultCountdownData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCountdownData()
  }, [])

  const fetchCountdownData = async () => {
    try {
      const response = await fetch("/api/settings/countdown")
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setCountdownData(result.data)
        }
      }
    } catch (error) {
      console.error("Error loading countdown data:", error)
      // Fallback to localStorage for backward compatibility
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("countdownCustomization")
        if (stored) {
          try {
            setCountdownData(JSON.parse(stored))
          } catch (e) {
            console.error("Error parsing localStorage:", e)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const updateCountdownData = async (data: CountdownData) => {
    setCountdownData(data)
    
    // Save to localStorage as cache
    if (typeof window !== "undefined") {
      localStorage.setItem("countdownCustomization", JSON.stringify(data))
    }

    // Save to database via API
    try {
      await fetch("/api/settings/countdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error("Error saving countdown data to database:", error)
    }
  }

  return (
    <CountdownContext.Provider value={{ countdownData, updateCountdownData }}>
      {children}
    </CountdownContext.Provider>
  )
}

export function useCountdown() {
  const context = useContext(CountdownContext)
  if (context === undefined) {
    throw new Error("useCountdown must be used within a CountdownProvider")
  }
  return context
}




