"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const blogPosts = [
  {
    id: "1",
    title: "10 Must-Have Tech Gadgets for 2025",
    excerpt: "Discover the latest technology trends and gadgets that will revolutionize your daily life this year.",
    image: "/modern-smartphone.png",
    category: "Technology",
    author: "Sarah Johnson",
    date: "Jan 15, 2025",
    readTime: "5 min read",
  },
  {
    id: "2",
    title: "The Ultimate Guide to Choosing Your Next Laptop",
    excerpt:
      "Everything you need to know before making your next laptop purchase, from specs to budget considerations.",
    image: "/silver-macbook-on-desk.png",
    category: "Guides",
    author: "Michael Chen",
    date: "Jan 12, 2025",
    readTime: "8 min read",
  },
  {
    id: "3",
    title: "Smart Home Devices That Actually Make Sense",
    excerpt: "Cut through the hype and find out which smart home devices are worth your investment.",
    image: "/apple-watch-lifestyle.png",
    category: "Smart Home",
    author: "Emily Rodriguez",
    date: "Jan 10, 2025",
    readTime: "6 min read",
  },
  {
    id: "4",
    title: "Gaming Setup Essentials for Beginners",
    excerpt: "Start your gaming journey right with these essential components and accessories.",
    image: "/classic-gamepad.png",
    category: "Gaming",
    author: "David Kim",
    date: "Jan 8, 2025",
    readTime: "7 min read",
  },
  {
    id: "5",
    title: "Wireless Audio: What to Look For in 2025",
    excerpt:
      "The wireless audio market is booming. Here's what features matter most in today's headphones and earbuds.",
    image: "/diverse-people-listening-headphones.png",
    category: "Audio",
    author: "Lisa Anderson",
    date: "Jan 5, 2025",
    readTime: "5 min read",
  },
  {
    id: "6",
    title: "Sustainable Tech: Eco-Friendly Electronics",
    excerpt: "Learn about the latest eco-friendly electronics and how to make more sustainable tech choices.",
    image: "/macbook-pro-on-desk.png",
    category: "Sustainability",
    author: "James Wilson",
    date: "Jan 3, 2025",
    readTime: "6 min read",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
            <p className="text-muted-foreground text-lg">
              Stay updated with the latest tech news, guides, and product reviews
            </p>
          </div>

          {/* Featured Post */}
          <Card className="mb-12 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative h-64 md:h-auto bg-muted">
                <img
                  src={blogPosts[0].image || "/placeholder.svg"}
                  alt={blogPosts[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4">{blogPosts[0].category}</Badge>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <Badge variant="outline" className="w-fit mb-4">
                  Featured
                </Badge>
                <h2 className="text-3xl font-bold mb-4 group-hover:text-blue-600 transition-colors">
                  {blogPosts[0].title}
                </h2>
                <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{blogPosts[0].author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{blogPosts[0].date}</span>
                  </div>
                  <span>{blogPosts[0].readTime}</span>
                </div>
                <Button className="w-fit">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-48 bg-muted">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4">{post.category}</Badge>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
