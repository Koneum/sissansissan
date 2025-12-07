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
    <section className="container mx-auto px-4 py-8 sm:py-12 overflow-hidden">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="heading-responsive-h2 mb-2">{t.products.bestSelling}</h2>
        <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
          Nos articles les plus populaires ! Découvrez ce que tout le monde adore en ce moment.
        </p>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-hidden scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {duplicatedProducts.map((product, index) => (
          <div key={`${product.id}-${index}`} className="flex-shrink-0 w-[280px] sm:w-[320px]">
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

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}




