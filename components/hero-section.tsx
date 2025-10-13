import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Main promo card */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 md:p-12 flex flex-col justify-between animate-in fade-in slide-in-from-left-8 duration-700">
          <div>
            <div className="inline-block mb-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
              <span className="text-blue-600 text-4xl md:text-5xl font-bold">30%</span>
              <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                <div>SALE</div>
                <div>OFF</div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-300">
              iPhone 16 Pro – 8/128GB
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm animate-in fade-in slide-in-from-top-4 duration-500 delay-400">
              Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the
            </p>
            <Button className="bg-[#1e293b] hover:bg-[#334155] text-white animate-in fade-in slide-in-from-top-4 duration-500 delay-500 hover:scale-105 transition-transform">
              Shop Now
            </Button>
          </div>
          <div className="flex justify-center mt-8 animate-in fade-in zoom-in duration-700 delay-300">
            <img src="/iphone-blue-tablet-device.jpg" alt="iPhone 16 Pro" className="w-64 h-auto" />
          </div>
        </Card>

        {/* Side product cards */}
        <div className="flex flex-col gap-6">
          <Card className="bg-white dark:bg-gray-900 p-6 flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700 delay-200 hover:shadow-lg transition-all hover:scale-[1.02]">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">iPhone 14 Pro & 14 Pro Max</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Get your special price from Iphone company
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">${"600"}</span>
                <span className="text-gray-400 line-through">${"858"}</span>
              </div>
            </div>
            <img src="/iphone-silver-smartphone.jpg" alt="iPhone 14 Pro" className="w-24 h-auto" />
          </Card>

          <Card className="bg-white dark:bg-gray-900 p-6 flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700 delay-400 hover:shadow-lg transition-all hover:scale-[1.02]">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Macbook Pro M4</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Get your special price to work in every where
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">${"600"}</span>
                <span className="text-gray-400 line-through">${"650"}</span>
              </div>
            </div>
            <img src="/macbook-laptop-blue-screen.jpg" alt="Macbook Pro" className="w-32 h-auto" />
          </Card>
        </div>
      </div>
    </section>
  )
}
