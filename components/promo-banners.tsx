import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PromoBanners() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gray-50 dark:bg-gray-900 p-8 flex items-center gap-6">
          <div className="flex-1">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Foldable Motorised Treadmill</div>
            <h3 className="text-3xl font-bold mb-4 text-[#1e293b] dark:text-white">Workout At Home</h3>
            <div className="text-blue-600 font-semibold mb-6">Flat 20% off</div>
            <Button className="bg-[#1e293b] hover:bg-[#334155] text-white">Grab the deal</Button>
          </div>
          <div className="flex-1 flex justify-center">
            <img src="/treadmill-exercise-equipment.jpg" alt="Treadmill" className="w-full max-w-xs h-auto" />
          </div>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-900 p-8 flex items-center gap-6">
          <div className="flex-1">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Apple Watch Ultra</div>
            <h3 className="text-3xl font-bold mb-4 text-[#1e293b] dark:text-white">Up to 40% off</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              The aerospace-grade titanium case strikes the perfect balance of everything.
            </p>
            <Button className="bg-[#1e293b] hover:bg-[#334155] text-white">Grab the deal</Button>
          </div>
          <div className="flex-1 flex justify-center">
            <img src="/apple-watch-ultra-green-band.jpg" alt="Apple Watch" className="w-full max-w-xs h-auto" />
          </div>
        </Card>
      </div>
    </section>
  )
}
