import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PromoBanner() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* iPhone Promo */}
        <Card className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 md:p-12 flex items-center justify-between overflow-hidden">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Apple iPhone 14 Plus</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">UP TO 30% OFF</h2>
            <p className="text-sm text-gray-600 mb-6 max-w-sm">
              iPhone 14 has the same superspeedy chip that's in iPhone 14 Pro. A15 Bionic, with a 5-core GPU, powers all
              the latest features.
            </p>
            <Button className="bg-[#1e293b] hover:bg-[#334155] text-white">Purchase Now</Button>
          </div>
          <div className="hidden md:block">
            <img src="/placeholder.svg?height=300&width=250" alt="iPhone 14" className="w-64 h-auto" />
          </div>
        </Card>

        {/* Treadmill Promo */}
        <Card className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 md:p-12 flex items-center justify-between overflow-hidden">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Foldable Motorized Treadmill</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Workout At Home</h2>
            <p className="text-sm text-gray-600 mb-2">Flat 30% off</p>
            <Button className="bg-[#1e293b] hover:bg-[#334155] text-white mt-4">Shop the deal</Button>
          </div>
          <div className="hidden md:block">
            <img src="/placeholder.svg?height=250&width=250" alt="Treadmill" className="w-56 h-auto" />
          </div>
        </Card>
      </div>

      {/* Apple Watch Promo */}
      <Card className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 md:p-12 flex items-center justify-between overflow-hidden">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">Apple Watch Ultra</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Up to 40% off</h2>
          <p className="text-sm text-gray-600 mb-6 max-w-md">
            The aerospace-grade titanium case strikes the perfect balance of weight, ruggedness, and corrosion
            resistance.
          </p>
          <Button className="bg-[#1e293b] hover:bg-[#334155] text-white">Shop the deal</Button>
        </div>
        <div className="hidden md:block">
          <img src="/placeholder.svg?height=300&width=300" alt="Apple Watch" className="w-72 h-auto" />
        </div>
      </Card>
    </section>
  )
}
