"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface HeroSlide {
  id: string
  badge: string
  title: string
  description: string
  image: string
  buttonText: string
  productId?: string
}

interface HeroSliderContextType {
  slides: HeroSlide[]
  updateSlides: (slides: HeroSlide[]) => void
  addSlide: (slide: HeroSlide) => void
  updateSlide: (id: string, slide: Partial<HeroSlide>) => void
  deleteSlide: (id: string) => void
}

const defaultSlides: HeroSlide[] = [
  {
    id: "1",
    badge: "33%",
    title: "iPhone 16 Pro - Premium Tech",
    description: "Experience the future with A18 Pro chip, titanium design, and advanced camera system",
    image: "/iphone-16-pro-blue.jpg",
    buttonText: "Shop Now",
    productId: "1"
  },
  {
    id: "2",
    badge: "29%",
    title: "MacBook Air M1 chip, 8/256GB",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi at ipsum at risus euismod lobortis in",
    image: "/airpods-max-headphones.jpg",
    buttonText: "Shop Now",
    productId: "2"
  },
  {
    id: "3",
    badge: "25%",
    title: "MacBook Pro M4 - Ultimate Power",
    description: "14-core CPU delivers exceptional performance for professionals and creators",
    image: "/macbook-pro-laptop.png",
    buttonText: "Shop Now",
    productId: "4"
  }
]

const HeroSliderContext = createContext<HeroSliderContextType | undefined>(undefined)

export function HeroSliderProvider({ children }: { children: ReactNode }) {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeroSliderData()
  }, [])

  const fetchHeroSliderData = async () => {
    try {
      const response = await fetch("/api/settings/hero-slider")
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setSlides(result.data)
        }
      }
    } catch (error) {
      console.error("Error loading hero slider data:", error)
      // Fallback to localStorage for backward compatibility
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("heroSliderCustomization")
        if (stored) {
          try {
            setSlides(JSON.parse(stored))
          } catch (e) {
            console.error("Error parsing localStorage:", e)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const saveToDatabase = async (newSlides: HeroSlide[]) => {
    // Save to localStorage as cache
    if (typeof window !== "undefined") {
      localStorage.setItem("heroSliderCustomization", JSON.stringify(newSlides))
    }

    // Save to database via API
    try {
      await fetch("/api/settings/hero-slider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlides)
      })
    } catch (error) {
      console.error("Error saving hero slider data to database:", error)
    }
  }

  const updateSlides = (newSlides: HeroSlide[]) => {
    setSlides(newSlides)
    saveToDatabase(newSlides)
  }

  const addSlide = (slide: HeroSlide) => {
    const newSlides = [...slides, slide]
    setSlides(newSlides)
    saveToDatabase(newSlides)
  }

  const updateSlide = (id: string, updatedSlide: Partial<HeroSlide>) => {
    const newSlides = slides.map(slide => 
      slide.id === id ? { ...slide, ...updatedSlide } : slide
    )
    setSlides(newSlides)
    saveToDatabase(newSlides)
  }

  const deleteSlide = (id: string) => {
    const newSlides = slides.filter(slide => slide.id !== id)
    setSlides(newSlides)
    saveToDatabase(newSlides)
  }

  return (
    <HeroSliderContext.Provider value={{ slides, updateSlides, addSlide, updateSlide, deleteSlide }}>
      {children}
    </HeroSliderContext.Provider>
  )
}

export function useHeroSlider() {
  const context = useContext(HeroSliderContext)
  if (context === undefined) {
    throw new Error("useHeroSlider must be used within a HeroSliderProvider")
  }
  return context
}

