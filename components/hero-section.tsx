"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatPrice } from "@/lib/currency"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  discountPrice?: number
  thumbnail?: string
  images?: string[]
  salePercentage?: number
}

export function HeroSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeroProducts()
  }, [])

  const fetchHeroProducts = async () => {
    try {
      const response = await fetch("/api/products?featured=true&limit=3")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching hero products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  const mainProduct = products[0]
  const sideProducts = products.slice(1, 3)

  if (!mainProduct) return null

  return (
    <section className="container mx-auto px-4 py-6 sm:py-8">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Main promo card */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 sm:p-8 md:p-12 flex flex-col justify-between animate-in fade-in slide-in-from-left-8 duration-700">
          <div>
            {mainProduct.salePercentage && (
              <div className="inline-block mb-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
                <span className="text-orange-600 text-3xl sm:text-4xl md:text-5xl font-bold">{mainProduct.salePercentage}%</span>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                  <div>SALE</div>
                  <div>OFF</div>
                </div>
              </div>
            )}
            <h1 className="heading-responsive-h2 mb-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-300">
              {mainProduct.name}
            </h1>
            {mainProduct.description && (
              <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-sm animate-in fade-in slide-in-from-top-4 duration-500 delay-400">
                {mainProduct.description}
              </p>
            )}
            <Link href={`/products/${mainProduct.id}`}>
              <Button className="bg-[#1e293b] hover:bg-[#334155] text-white animate-in fade-in slide-in-from-top-4 duration-500 delay-500 hover:scale-105 transition-transform">
                Shop Now
              </Button>
            </Link>
          </div>
          <div className="flex justify-center mt-6 sm:mt-8 animate-in fade-in zoom-in duration-700 delay-300">
            <img 
              src={mainProduct.thumbnail || mainProduct.images?.[0] || "/placeholder.svg"} 
              alt={mainProduct.name} 
              className="w-48 sm:w-56 md:w-64 h-auto" 
            />
          </div>
        </Card>

        {/* Side product cards */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {sideProducts.map((product, index) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="bg-white dark:bg-gray-900 p-4 sm:p-6 flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-right-8 duration-700 hover:shadow-lg transition-all hover:scale-[1.02]" style={{ animationDelay: `${(index + 1) * 200}ms` }}>
                <div className="flex-1">
                  <h3 className="font-bold text-base sm:text-lg mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold">
                      {formatPrice(product.discountPrice || product.price)}
                    </span>
                    {product.discountPrice && (
                      <span className="text-responsive-sm text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
                <img 
                  src={product.thumbnail || product.images?.[0] || "/placeholder.svg"} 
                  alt={product.name} 
                  className="w-20 sm:w-24 md:w-32 h-auto" 
                />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}




