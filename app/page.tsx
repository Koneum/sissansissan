import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FeaturedProducts } from "@/components/featured-products"
import { HeroCarousel } from "@/components/hero-carousel"
import { CategoryBrowser } from "@/components/category-browser"
import { NewArrivals } from "@/components/new-arrivals"
import { PromoBanners } from "@/components/promo-banners"
import { BestSelling } from "@/components/best-selling"
import { CountdownSection } from "@/components/countdown-section"
import { Testimonials } from "@/components/testimonials"
import { Newsletter } from "@/components/newsletter"
import { Features } from "@/components/features"
import { HomeShopFilters } from "@/components/home-shop-filters"
import { HomeAllProducts } from "@/components/home-all-products"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <HomeShopFilters />
        <HeroCarousel />
        <CategoryBrowser />
        <NewArrivals />
        
        <BestSelling />
        <HomeAllProducts />
        <CountdownSection />
        <PromoBanners />
        <Newsletter />
        <Features />
      </main>
      <Footer />
    </div>
  )
}


//DEV BY MOUSSA KONE ET ABOUBAKAR SIDIBE (KRIS BEAT)

