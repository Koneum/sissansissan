"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Zap } from "lucide-react"
import { useHeroSlider } from "@/lib/hero-slider-context"

export function HeroCarousel() {
  const { slides } = useHeroSlider()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState<
    { left: string; top: string; animationDelay: string; animationDuration: string }[]
  >([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setParticles(
      [...Array(20)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }))
    )
  }, [])

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true)
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setTimeout(() => setIsAnimating(false), 700)
      }
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length, isAnimating])

  // Mouse parallax effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / 25
    const y = (e.clientY - rect.top - rect.height / 2) / 25
    setMousePosition({ x, y })
  }, [])

  const goToSlide = (index: number) => {
    if (!isAnimating && index !== currentSlide) {
      setIsAnimating(true)
      setCurrentSlide(index)
      setTimeout(() => setIsAnimating(false), 700)
    }
  }

  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length)
  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length)

  return (
    <section 
      className="relative w-full min-h-[85vh] md:min-h-[90vh] overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-background"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div 
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full opacity-30 blur-[120px] transition-transform duration-1000"
          style={{ 
            background: 'radial-gradient(circle, rgba(249,115,22,0.6) 0%, transparent 70%)',
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
          }}
        />
        <div 
          className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] rounded-full opacity-25 blur-[120px] transition-transform duration-1000"
          style={{ 
            background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%)',
            transform: `translate(${-mousePosition.x * 2}px, ${-mousePosition.y * 2}px)`
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)' }}
        />
        
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating Particles */}
        {isMounted &&
          particles.map((p, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={p}
            />
          ))}
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
          
          {/* Left Content */}
          <div 
            className="relative z-10 order-2 lg:order-1"
            style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
          >
            {/* Badge - Affiché seulement si défini */}
            {slides[currentSlide].badge && slides[currentSlide].badge.trim() !== "" && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 backdrop-blur-sm mb-6 animate-in slide-in-from-left duration-500">
                <Zap className="w-4 h-4 text-orange-500 dark:text-orange-400 animate-pulse" />
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-300 uppercase tracking-wider">
                  {slides[currentSlide].badge}
                </span>
                <Sparkles className="w-4 h-4 text-pink-500 dark:text-pink-400" />
              </div>
            )}

            {/* Title */}
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6 leading-[0.95] tracking-tight"
              key={`title-${currentSlide}`}
            >
              <span className="block animate-in slide-in-from-bottom-4 duration-500">
                {slides[currentSlide].title.split(' ').slice(0, 2).join(' ')}
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                {slides[currentSlide].title.split(' ').slice(2).join(' ') || 'Premium'}
              </span>
            </h1>

            {/* Description */}
            <p 
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300/80 mb-8 max-w-lg leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-150"
              key={`desc-${currentSlide}`}
            >
              {slides[currentSlide].description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
              <Link href={slides[currentSlide].productId ? `/products/${slides[currentSlide].productId}` : "/shop"}>
                <Button 
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-7 rounded-2xl shadow-[0_20px_50px_rgba(249,115,22,0.3)] hover:shadow-[0_25px_60px_rgba(249,115,22,0.4)] transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {slides[currentSlide].buttonText || "Acheter Maintenant"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="/shop">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-white/80 dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:bg-white dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/40 font-semibold text-lg px-8 py-7 rounded-2xl backdrop-blur-sm transition-all duration-300"
                >
                  Explorer la Collection
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-slate-200 dark:border-white/10 animate-in slide-in-from-bottom-4 duration-500 delay-300">
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">50K+</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Clients Satisfaits</p>
              </div>
              <div className="w-px h-12 bg-slate-300 dark:bg-white/20" />
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">4.9</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Note Moyenne</p>
              </div>
              <div className="w-px h-12 bg-slate-300 dark:bg-white/20 hidden sm:block" />
              <div className="hidden sm:block">
                <p className="text-3xl font-black text-slate-900 dark:text-white">24h</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Livraison Rapide</p>
              </div>
            </div>
          </div>

          {/* Right Content - Product Image */}
          <div 
            className="relative order-1 lg:order-2 flex justify-center items-center"
            style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
          >
            {/* Glow Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-br from-orange-500/30 via-pink-500/20 to-purple-500/30 blur-[80px] animate-pulse" />
            </div>

            {/* Glassmorphism Card */}
            <div 
              className="relative group"
              key={`image-${currentSlide}`}
            >
              {/* Card Background */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 rounded-[40px] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
              
              {/* Main Card */}
              <div className="relative bg-white/80 dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 backdrop-blur-xl rounded-[32px] p-6 md:p-10 border border-slate-200/50 dark:border-white/20 shadow-2xl shadow-slate-900/10 dark:shadow-black/20">
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-orange-500/30 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-purple-500/30 to-transparent rounded-full blur-2xl" />
                
                {/* Product Image */}
                <div className="relative">
                  <Image
                    src={slides[currentSlide].image || "/placeholder.svg"}
                    alt={slides[currentSlide].title}
                    width={500}
                    height={500}
                    className="relative w-full max-w-[350px] md:max-w-[450px] h-auto object-contain drop-shadow-2xl animate-in zoom-in-95 duration-700"
                    style={{
                      filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.4))',
                      animation: 'float 6s ease-in-out infinite'
                    }}
                    priority
                  />
                </div>

                {/* Price Tag - Affiché seulement si badge défini */}
                {slides[currentSlide].badge && slides[currentSlide].badge.trim() !== "" && (
                  <div className="absolute -bottom-4 -right-4 md:bottom-4 md:right-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-2xl shadow-lg animate-in slide-in-from-right duration-500">
                    <p className="text-xs font-medium opacity-80">Réduction</p>
                    <p className="text-2xl font-black">{slides[currentSlide].badge}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Slide Indicators */}
          <div className="flex items-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative h-2 rounded-full transition-all duration-500 overflow-hidden ${
                  index === currentSlide ? "w-12 bg-slate-800 dark:bg-white" : "w-2 bg-slate-300 dark:bg-white/30 hover:bg-slate-400 dark:hover:bg-white/50"
                }`}
                aria-label={`Aller au slide ${index + 1}`}
              >
                {index === currentSlide && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Arrow Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="group w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-lg shadow-slate-900/5"
              aria-label="Slide précédent"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-white group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={nextSlide}
              className="group w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-lg shadow-slate-900/5"
              aria-label="Slide suivant"
            >
              <ChevronRight className="w-5 h-5 text-slate-700 dark:text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Float Animation Keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
      `}</style>
    </section>
  )
}

//DEV BY MOUSSA KONE ET ABOUBAKAR SIDIBE (KRIS BEAT)



