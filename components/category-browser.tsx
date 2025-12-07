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
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-full text-sm font-medium text-orange-600 dark:text-orange-400 mb-3">
              Explorer
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
              {t.categories.title}
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                canScrollLeft 
                  ? "bg-white dark:bg-slate-900 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:border-transparent shadow-sm" 
                  : "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                canScrollRight 
                  ? "bg-white dark:bg-slate-900 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:border-transparent shadow-sm" 
                  : "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Gradient overlays */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
          )}

          {/* Scrollable container */}
          <div 
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group flex-shrink-0 relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card */}
                <div className="relative w-32 sm:w-40 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-2">
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-px bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
                  
                  {/* Image Container */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                      <img 
                        src={category.image || "/placeholder.svg"} 
                        alt={category.name} 
                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <p className="text-xs sm:text-sm font-semibold text-center text-slate-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                    {category.name}
                  </p>

                  {/* Arrow indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}




