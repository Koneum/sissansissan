"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useCountdown } from "@/lib/countdown-context"

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

  return (
    <section className="container mx-auto px-4 py-8 sm:py-12">
      <div 
        className="rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
        style={{ backgroundColor: countdownData.backgroundColor, color: countdownData.textColor }}
      >
        <div className="flex-1">
          <div className="font-semibold mb-2 opacity-90">Don&apos;t Miss!!</div>
          <h2 className="text-4xl font-bold mb-4">{countdownData.title}</h2>
          <p className="mb-8 opacity-80">Limited time offer - Shop now before it&apos;s too late!</p>

          <div className="flex gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center min-w-[80px]">
              <div className="text-3xl font-bold text-[#1e293b] dark:text-white">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Days</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center min-w-[80px]">
              <div className="text-3xl font-bold text-[#1e293b] dark:text-white">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hours</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center min-w-[80px]">
              <div className="text-3xl font-bold text-[#1e293b] dark:text-white">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center min-w-[80px]">
              <div className="text-3xl font-bold text-[#1e293b] dark:text-white">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Seconds</div>
            </div>
          </div>

          <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8">Check it Out!</Button>
        </div>

        <div className="flex-1 flex justify-center">
          <img src="/black-bluetooth-speaker-with-blue-accent.jpg" alt="Speaker" className="w-full max-w-md h-auto" />
        </div>
      </div>
    </section>
  )
}




