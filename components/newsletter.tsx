import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  return (
    <section className="container mx-auto px-4 py-8 sm:py-12">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 sm:p-8 md:p-12 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="heading-responsive-h2 mb-4">Don't Miss Out Latest Trends & Offers</h2>
          <p className="text-responsive-sm mb-6 sm:mb-8 text-blue-50">Register to receive news about the latest offers & discount codes</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <Input type="email" placeholder="Enter your email" className="flex-1 bg-white text-gray-900 border-0" />
            <Button className="bg-blue-700 hover:bg-blue-800 text-white px-8">Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
