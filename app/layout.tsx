import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { LocaleProvider } from "@/lib/locale-context"
import { FooterProvider } from "@/lib/footer-context"
import { HeaderProvider } from "@/lib/header-context"
import { HeroSliderProvider } from "@/lib/hero-slider-context"
import { SEOProvider } from "@/lib/seo-context"
import { PagesProvider } from "@/lib/pages-context"
import { CountdownProvider } from "@/lib/countdown-context"
import { PromoProvider } from "@/lib/promo-context"
import { NewsletterProvider } from "@/lib/newsletter-context"
import { FeaturesProvider } from "@/lib/features-context"
import { Chatbot } from "@/components/chatbot"
import { Toaster } from "sonner"
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
})

const geistSans = { variable: "--font-geist-sans" } // Assuming this is defined somewhere
const geistMono = { variable: "--font-geist-mono" } // Assuming this is defined somewhere

export const metadata: Metadata = {
  title: "Sissan-Sissan",
  description: "Sissan-Sissan, votre nouvelle destination pour les produits de tout genre",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Analytics/>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <LocaleProvider>
              <SEOProvider>
                <PagesProvider>
                  <CountdownProvider>
                    <PromoProvider>
                      <NewsletterProvider>
                        <FeaturesProvider>
                          <HeaderProvider>
                            <FooterProvider>
                              <HeroSliderProvider>
                                <WishlistProvider>
                                  <CartProvider>
                                    <Toaster position="bottom-right" richColors />
                                    <ShadcnToaster />
                                    {children}
                                    {/* <Chatbot /> */}
                                  </CartProvider>
                                </WishlistProvider>
                              </HeroSliderProvider>
                            </FooterProvider>
                          </HeaderProvider>
                        </FeaturesProvider>
                      </NewsletterProvider>
                    </PromoProvider>
                  </CountdownProvider>
                </PagesProvider>
              </SEOProvider>
            </LocaleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


//DEV BY MOUSSA KONE ET ABOUBAKAR SIDIBE (KRIS BEAT)

