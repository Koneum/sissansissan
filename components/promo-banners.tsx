"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { usePromo } from "@/lib/promo-context"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export function PromoBanners() {
  const { promoBanners, loading } = usePromo()

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (promoBanners.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-8 sm:py-12">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {promoBanners.slice(0, 2).map((banner) => (
          <Card key={banner.id} className="bg-gray-50 dark:bg-gray-900 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex-1">
              {banner.subtitle && (
                <div className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-2">{banner.subtitle}</div>
              )}
              <h3 className="heading-responsive-h2 mb-4 text-[#1e293b] dark:text-white">{banner.title}</h3>
              {banner.discount && (
                <div className="text-blue-600 font-semibold mb-4 sm:mb-6">{banner.discount}</div>
              )}
              {banner.description && (
                <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  {banner.description}
                </p>
              )}
              <Link href={banner.buttonLink}>
                <Button className="bg-[#1e293b] hover:bg-[#334155] text-white">
                  {banner.buttonText}
                </Button>
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <img 
                src={banner.image || "/placeholder.svg"} 
                alt={banner.title} 
                className="w-full max-w-xs h-auto" 
              />
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
