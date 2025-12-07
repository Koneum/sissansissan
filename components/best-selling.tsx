"use client"

import { useEffect, useRef, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { useLocale } from "@/lib/locale-context"

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  thumbnail?: string
  images?: string[]
  salePercentage?: number
  isNew?: boolean
}

export function BestSelling() {
  const { t } = useLocale()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBestSellingProducts()
  }, [])

  const fetchBestSellingProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products?isFeatured=true&limit=10")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching best selling products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || products.length === 0) return

    let scrollAmount = 0
    const scrollSpeed = 0.5 // pixels per frame
    let intervalId: NodeJS.Timeout | null = null

    const scroll = () => {
      if (container) {
        scrollAmount += scrollSpeed
        
        // If we've scrolled past halfway, reset to create seamless loop
        if (scrollAmount >= container.scrollWidth / 2) {
          scrollAmount = 0
        }
        
        container.scrollLeft = scrollAmount
      }
    }

    const startScrolling = () => {
      if (intervalId) clearInterval(intervalId)
      intervalId = setInterval(scroll, 16) // ~60fps
    }

    const stopScrolling = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    // Start auto-scroll
    startScrolling()

    // Pause on hover
    const handleMouseEnter = () => stopScrolling()
    const handleMouseLeave = () => startScrolling()

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      stopScrolling()
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [products])

  // Duplicate products for seamless infinite scroll
  const duplicatedProducts = [...products, ...products]

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="heading-responsive-h2 mb-2">{t.products.bestSelling}</h2>
          <p className="text-responsive-sm text-gray-600 dark:text-gray-400">{t.common.loading}</p>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-full text-sm font-semibold text-orange-600 dark:text-orange-400 mb-4">
            🔥 Tendance
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">
            {t.products.bestSelling}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Découvrez les produits que tout le monde adore en ce moment
          </p>
        </div>

        {/* Infinite Scroll Container */}
        <div className="relative">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth py-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {duplicatedProducts.map((product, index) => (
              <div key={`${product.id}-${index}`} className="flex-shrink-0 w-[280px] sm:w-[300px]">
                <ProductCard 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.discountPrice || product.price,
                    originalPrice: product.discountPrice ? product.price : undefined,
                    image: product.thumbnail || product.images?.[0] || "/placeholder.svg",
                    salePercentage: product.salePercentage,
                    isNew: product.isNew
                  }} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <p className="text-center text-sm text-slate-400 mt-6">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-pulse" />
            Défilement automatique - Survolez pour arrêter
            <span className="w-6 h-0.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full animate-pulse" />
          </span>
        </p>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}




