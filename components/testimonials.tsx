"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Davis Dorwart",
    role: "Serial Entrepreneur",
    text: "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula",
    avatar: "/man-profile.png",
    rating: 5,
  },
  {
    name: "Wilson Dias",
    role: "Backend Developer",
    text: "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula",
    avatar: "/man-profile-photo-2.png",
    rating: 5,
  },
  {
    name: "Davis Dorwart",
    role: "Serial Entrepreneur",
    text: "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula",
    avatar: "/man-profile-photo-3.png",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">User Feedbacks</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="p-6">
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{testimonial.text}</p>
            <div className="flex items-center gap-3">
              <img
                src={testimonial.avatar || "/placeholder.svg"}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-semibold text-[#1e293b] dark:text-white">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
