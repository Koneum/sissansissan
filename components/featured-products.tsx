import { Card } from "@/components/ui/card"

const products = [
  {
    name: "MacBook Air M1 chip, 8/256GB",
    price: 899,
    originalPrice: 930,
    image: "/macbook-laptop-blue-screen.jpg",
  },
  {
    name: "Indoor Steel Adjustable Silent...",
    price: 888,
    originalPrice: 999,
    image: "/wireless-mouse-black.jpg",
  },
  {
    name: "Rangs 43 Inch Frameless FHD Double...",
    price: 700,
    originalPrice: 799,
    image: "/tv-screen-display.jpg",
  },
  {
    name: "Apple Watch Ultra",
    price: 89,
    originalPrice: 99,
    image: "/apple-watch-orange-band.jpg",
  },
]

export function FeaturedProducts() {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <Card
            key={index}
            className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="relative bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center h-48">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-2 line-clamp-2 text-sm">{product.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                <span className="text-lg font-bold">${product.price}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
