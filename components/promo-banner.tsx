"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { usePromo } from "@/lib/promo-context"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export function PromoBanner() {
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

  const firstTwoBanners = promoBanners.slice(0, 2)
  const thirdBanner = promoBanners[2]

  return (
    <section className="container mx-auto px-4 py-8 sm:py-12">
      {firstTwoBanners.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {firstTwoBanners.map((banner) => (
            <Card 
              key={banner.id} 
              className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between overflow-hidden gap-4"
            >
              <div className="flex-1">
                {banner.subtitle && (
                  <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-2">{banner.subtitle}</p>
                )}
                <h2 className="heading-responsive-h2 mb-4">{banner.title}</h2>
                {banner.description && (
                  <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-sm">
                    {banner.description}
                  </p>
                )}
                {banner.discount && (
                  <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-2">{banner.discount}</p>
                )}
                <Link href={banner.buttonLink}>
                  <Button className="bg-[#1e293b] hover:bg-[#334155] text-white mt-2 sm:mt-4">
                    {banner.buttonText}
                  </Button>
                </Link>
              </div>
              <div className="hidden md:block">
                <img 
                  src={banner.image || "/placeholder.svg"} 
                  alt={banner.title} 
                  className="w-48 sm:w-56 md:w-64 h-auto" 
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {thirdBanner && (
        <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between overflow-hidden gap-4">
          <div className="flex-1">
            {thirdBanner.subtitle && (
              <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-2">{thirdBanner.subtitle}</p>
            )}
            <h2 className="heading-responsive-h2 mb-4">{thirdBanner.title}</h2>
            {thirdBanner.description && (
              <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md">
                {thirdBanner.description}
              </p>
            )}
            {thirdBanner.discount && (
              <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mb-2">{thirdBanner.discount}</p>
            )}
            <Link href={thirdBanner.buttonLink}>
              <Button className="bg-[#1e293b] hover:bg-[#334155] text-white">
                {thirdBanner.buttonText}
              </Button>
            </Link>
          </div>
          <div className="hidden md:block">
            <img 
              src={thirdBanner.image || "/placeholder.svg"} 
              alt={thirdBanner.title} 
              className="w-56 sm:w-64 md:w-72 h-auto" 
            />
          </div>
        </Card>
      )}
    </section>
  )
}




