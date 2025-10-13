import { Card } from "@/components/ui/card"
import Link from "next/link"

const bestSellers = [
  {
    id: 1,
    name: "iPhone 16 Pro – 8/128GB",
    price: 600,
    originalPrice: 676,
    image: "/iphone-blue-smartphone.jpg",
  },
  {
    id: 2,
    name: "Apple Watch Ultra",
    price: 89,
    originalPrice: 99,
    image: "/apple-watch-orange-band.jpg",
  },
  {
    id: 3,
    name: "Macbook Pro – 12/512GB",
    price: 600,
    originalPrice: null,
    image: "/ipad-tablet-blue.jpg",
  },
  {
    id: 4,
    name: "Benq 43 inch Frameless FHD Double Glass Android TV",
    price: 700,
    originalPrice: 799,
    image: "/tv-screen-display.jpg",
  },
  {
    id: 5,
    name: "Portable Electric Grinder Mixer",
    price: 77,
    originalPrice: 100,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 6,
    name: "Apple iMac M4 24-inch 2025",
    price: 333,
    originalPrice: 500,
    image: "/placeholder.svg?height=200&width=200",
  },
]

export function BestSellingProducts() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Best Selling Products</h2>
        <p className="text-gray-600 text-sm">
          These top picks are flying off the shelves! Find out what everyone's loving right now.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {bestSellers.map((product) => (
          <Card key={product.id} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative bg-gray-50 p-6 flex items-center justify-center h-64">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-2 line-clamp-2 text-sm">{product.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link href="/shop" className="inline-block text-sm font-medium text-blue-600 hover:underline">
          View All
        </Link>
      </div>
    </section>
  )
}
