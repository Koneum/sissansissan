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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("heroSliderCustomization")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setSlides(parsed)
        } catch (error) {
          console.error("Error loading hero slider data:", error)
        }
      }
    }
  }, [])

  const saveToLocalStorage = (newSlides: HeroSlide[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("heroSliderCustomization", JSON.stringify(newSlides))
    }
  }

  const updateSlides = (newSlides: HeroSlide[]) => {
    setSlides(newSlides)
    saveToLocalStorage(newSlides)
  }

  const addSlide = (slide: HeroSlide) => {
    const newSlides = [...slides, slide]
    setSlides(newSlides)
    saveToLocalStorage(newSlides)
  }

  const updateSlide = (id: string, updatedSlide: Partial<HeroSlide>) => {
    const newSlides = slides.map(slide => 
      slide.id === id ? { ...slide, ...updatedSlide } : slide
    )
    setSlides(newSlides)
    saveToLocalStorage(newSlides)
  }

  const deleteSlide = (id: string) => {
    const newSlides = slides.filter(slide => slide.id !== id)
    setSlides(newSlides)
    saveToLocalStorage(newSlides)
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

