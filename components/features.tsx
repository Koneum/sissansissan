import { Rocket, RotateCcw, Shield, Headphones } from "lucide-react"

const features = [
  {
    icon: Rocket,
    title: "Free Shipping",
    description: "For all orders $200",
  },
  {
    icon: RotateCcw,
    title: "1 & 1 Returns",
    description: "Cancellation after 1 day",
  },
  {
    icon: Shield,
    title: "100% Secure Payments",
    description: "Guarantee secure payments",
  },
  {
    icon: Headphones,
    title: "24/7 Dedicated Support",
    description: "Anywhere & anytime",
  },
]

export function Features() {
  return (
    <section className="container mx-auto px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <feature.icon className="w-6 h-6 text-[#1e293b] dark:text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-[#1e293b] dark:text-white">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}




