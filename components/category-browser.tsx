"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"

interface Category {
  id: string
  name: string
  slug: string
  image?: string
}

export function CategoryBrowser() {
  const { t } = useLocale()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    window.addEventListener("resize", checkScrollButtons)
    return () => window.removeEventListener("resize", checkScrollButtons)
  }, [categories])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollLeft = direction === "left" 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth"
      })
      
      // Check buttons after scroll animation
      setTimeout(checkScrollButtons, 350)
    }
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold">{t.categories.title}</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-28 sm:w-36 animate-pulse">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mt-3 mx-4" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold">{t.categories.title}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border transition-all duration-200 ${
              canScrollLeft 
                ? "hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950 text-slate-700 dark:text-slate-300" 
                : "opacity-40 cursor-not-allowed text-slate-400"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border transition-all duration-200 ${
              canScrollRight 
                ? "hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950 text-slate-700 dark:text-slate-300" 
                : "opacity-40 cursor-not-allowed text-slate-400"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Gradient overlays for scroll indication */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        )}

        {/* Scrollable container */}
        <div 
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="flex-shrink-0 flex flex-col items-center gap-3 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 group border border-transparent hover:border-orange-200 dark:hover:border-orange-800"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <img 
                  src={category.image || "/placeholder.svg"} 
                  alt={category.name} 
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center text-slate-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors whitespace-nowrap">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}




