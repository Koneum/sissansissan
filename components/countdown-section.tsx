"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useCountdown } from "@/lib/countdown-context"
import { Zap, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CountdownSection() {
  const { countdownData } = useCountdown()
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endDate = new Date(countdownData.endDate).getTime()
      const now = new Date().getTime()
      const difference = endDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [countdownData.endDate])

  if (!countdownData.enabled) {
    return null
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 text-center min-w-[70px] sm:min-w-[90px]">
        <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {String(value).padStart(2, "0")}
        </div>
        <div className="text-xs sm:text-sm font-medium text-white/70 uppercase tracking-widest mt-1">{label}</div>
      </div>
    </div>
  )

  return (
    <section className="container mx-auto px-4 py-8 sm:py-16">
      <div 
        className="relative overflow-hidden rounded-3xl"
        style={{ backgroundColor: countdownData.backgroundColor }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left" style={{ color: countdownData.textColor }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold uppercase tracking-wider">Flash Sale</span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
              {countdownData.title}
            </h2>
            <p className="text-lg sm:text-xl opacity-80 mb-8 max-w-lg">
              Offre limitée - Ne manquez pas cette opportunité exceptionnelle !
            </p>

            {/* Countdown */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mb-10">
              <TimeBlock value={timeLeft.days} label="Jours" />
              <TimeBlock value={timeLeft.hours} label="Heures" />
              <TimeBlock value={timeLeft.minutes} label="Min" />
              <TimeBlock value={timeLeft.seconds} label="Sec" />
            </div>

            {/* CTA Button */}
            <Link href="/products?sale=true">
              <Button 
                size="lg"
                className="group bg-white text-gray-900 hover:bg-white/90 font-bold px-8 py-6 text-lg rounded-full shadow-2xl shadow-black/20 transition-all hover:scale-105"
              >
                Découvrir les offres
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Image with floating effect */}
          <div className="flex-1 flex justify-center relative">
            <div className="relative">
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent rounded-full blur-3xl scale-110" />
              <img 
                src={countdownData.image || "/black-bluetooth-speaker-with-blue-accent.jpg"} 
                alt="Product" 
                className="relative w-full max-w-sm lg:max-w-md h-auto drop-shadow-2xl animate-float"
                style={{ animation: 'float 6s ease-in-out infinite' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  )
}




