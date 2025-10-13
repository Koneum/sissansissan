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
    if (!container) return

    let scrollAmount = 0
    const scrollSpeed = 0.5 // pixels per frame

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

    const intervalId = setInterval(scroll, 16) // ~60fps

    // Pause on hover
    const handleMouseEnter = () => clearInterval(intervalId)
    const handleMouseLeave = () => {
      const newIntervalId = setInterval(scroll, 16)
      return () => clearInterval(newIntervalId)
    }

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      clearInterval(intervalId)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  // Duplicate products for seamless infinite scroll
  const duplicatedProducts = [...products, ...products]

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{t.products.bestSelling}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t.common.loading}</p>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-12 overflow-hidden">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{t.products.bestSelling}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Nos articles les plus populaires ! Découvrez ce que tout le monde adore en ce moment.
        </p>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-hidden scroll-smooth"
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
