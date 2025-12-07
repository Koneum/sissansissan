"use client"

import { Truck, RotateCcw, Shield, Headphones, Package, CreditCard, Clock, Award, type LucideIcon } from "lucide-react"
import { useFeatures } from "@/lib/features-context"

// Map des icônes disponibles
const iconMap: Record<string, LucideIcon> = {
  Truck,
  RotateCcw,
  Shield,
  Headphones,
  Package,
  CreditCard,
  Clock,
  Award,
}

// Délais d'animation
const delays = ["0ms", "100ms", "200ms", "300ms"]

export function Features() {
  const { featuresData } = useFeatures()

  // Ne pas afficher si désactivé
  if (!featuresData.enabled) {
    return null
  }

  // Convertir les features avec les icônes
  const features = featuresData.features.map((f, index) => ({
    icon: iconMap[f.icon] || Package,
    title: f.title,
    description: f.description,
    gradient: f.gradient,
    delay: delays[index % delays.length],
  }))
  return (
    <section className="container mx-auto px-4 py-8 sm:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="group relative"
            style={{ animationDelay: feature.delay }}
          >
            {/* Glow effect on hover */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
            
            {/* Card */}
            <div className="relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 h-full transition-all duration-300 group-hover:border-transparent group-hover:shadow-xl group-hover:-translate-y-1">
              {/* Icon container */}
              <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative corner */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-full`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}




