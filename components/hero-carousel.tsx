"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useHeroSlider } from "@/lib/hero-slider-context"

export function HeroCarousel() {
  const { slides } = useHeroSlider()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="w-full  py-12 px-4 relative">
      <div className="container mx-auto max-w-7xl ">
        <div className="relative">
          {/* Main carousel card */}
          <div className="relative flex items-center justify-center min-h-[500px] md:min-h-[600px]">
            <div 
              className="w-full max-w-5xl mx-auto bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#1a1a1a] rounded-3xl p-8 md:p-12 
              shadow-[0_0_80px_rgba(0,0,0,0.5),0_0_120px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]
              border border-white/5"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Product Image */}
                <div className="flex justify-center items-center order-1 md:order-1">
                  <div 
                    className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 p-8
                    shadow-[0_20px_60px_rgba(168,85,247,0.4),0_0_80px_rgba(236,72,153,0.3),0_0_100px_rgba(59,130,246,0.2)]
                    backdrop-blur-sm border border-white/10"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 50%, rgba(59, 130, 246, 0.15) 100%)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-orange-600/10 blur-3xl" />
                    <Image
                      src={slides[currentSlide].image || "/placeholder.svg"}
                      alt={slides[currentSlide].title}
                      width={500}
                      height={400}
                      className="relative w-full max-w-md h-auto object-contain transition-all duration-700 ease-in-out"
                      style={{
                        filter: 'drop-shadow(0 10px 30px rgba(168, 85, 247, 0.3))'
                      }}
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col justify-center order-2 md:order-2">
                  <div className="mb-4">
                    <span className="text-orange-400 text-6xl font-bold">{slides[currentSlide].badge}</span>
                    <div className="text-sm text-gray-400 uppercase mt-1">
                      <div>SALE</div>
                      <div>OFF</div>
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white leading-tight">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-gray-400 text-lg mb-6">{slides[currentSlide].description}</p>

                  {/* CTA Button */}
                  <Link href={slides[currentSlide].productId ? `/products/${slides[currentSlide].productId}` : "#"}>
                    <Button 
                      className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-lg font-semibold py-6 rounded-2xl
                      shadow-[0_10px_40px_rgba(79,70,229,0.4),0_0_20px_rgba(79,70,229,0.3)]
                      transition-all duration-300 hover:shadow-[0_15px_50px_rgba(79,70,229,0.5),0_0_30px_rgba(79,70,229,0.4)]
                      hover:scale-[1.02] cursor-pointer"
                    >
                      {slides[currentSlide].buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center
            bg-black dark:bg-white/5 hover:bg-gray-500/60 rounded-full backdrop-blur-sm border border-white/10
            transition-all duration-300 hover:scale-110 z-10 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center
            bg-black dark:bg-white/5 hover:bg-gray-500/60 rounded-full backdrop-blur-sm border border-white/10
            transition-all duration-300 hover:scale-110 z-10 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? "w-12 bg-white" 
                    : "w-8 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

//DEV BY MOUSSA KONE ET ABOUBAKAR SIDIBE (KRIS BEAT)



