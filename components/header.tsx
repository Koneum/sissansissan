"use client"

import Link from "next/link"
import { Search, User, Heart, ShoppingCart, Menu, X } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { LocaleToggle } from "./locale-toggle"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { useHeader } from "@/lib/header-context"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { CartSidebar } from "./cart-sidebar"
import { useState } from "react"
import { Input } from "./ui/input"

export function Header() {
  const { itemCount } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const { user, signOut } = useAuth()
  const { t } = useLocale()
  const { headerData } = useHeader()
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      {/* Top banner */}
      {headerData.topBannerEnabled && (
        <div className="bg-primary text-primary-foreground text-center py-2 text-sm px-4">
          <p className="animate-in fade-in slide-in-from-top-2 duration-500">{headerData.topBannerText}</p>
        </div>
      )}

      {/* Main header */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src={headerData.logoUrl}
                alt="Zissan-Sissan"
                className="h-10 w-auto"
              />
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors relative group">
                {t.nav.home}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors relative group">
                {t.nav.shop}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium hover:text-primary transition-colors relative group"
              >
                {t.nav.pages}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors relative group">
                {t.nav.blog}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors relative group">
                {t.nav.contact}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                className="hover:scale-110 transition-transform"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* User */}
              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  title={t.auth.signOut}
                  className="hover:scale-110 transition-transform"
                >
                  <User className="w-4 h-4" />
                </Button>
              ) : (
                <Link href="/signin">
                  <Button
                    variant="ghost"
                    size="icon"
                    title={t.auth.signIn}
                    className="hover:scale-110 transition-transform"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
              )}

              {/* Wishlist - Hidden on mobile */}
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex relative hover:scale-110 transition-transform"
                >
                  <Heart className="w-4 h-4" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in duration-300">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="relative hover:scale-110 transition-transform"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in duration-300">
                    {itemCount}
                  </span>
                )}
              </Button>

              {/* Theme & Locale - Hidden on small mobile */}
              <div className="hidden sm:flex items-center gap-1">
                <ThemeToggle />
                <LocaleToggle />
              </div>

              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col gap-6 mt-8">
                    <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                      {t.nav.home}
                    </Link>
                    <Link href="/shop" className="text-lg font-medium hover:text-primary transition-colors">
                      {t.nav.shop}
                    </Link>
                    <Link href="/products" className="text-lg font-medium hover:text-primary transition-colors">
                      {t.nav.pages}
                    </Link>
                    <Link href="/blog" className="text-lg font-medium hover:text-primary transition-colors">
                      {t.nav.blog}
                    </Link>
                    <Link href="/contact" className="text-lg font-medium hover:text-primary transition-colors">
                      {t.nav.contact}
                    </Link>
                    <Link href="/wishlist" className="text-lg font-medium hover:text-primary transition-colors flex items-center justify-between">
                      <span>Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    {/* Mobile-only options */}
                    <div className="border-t pt-6 mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Theme</span>
                        <ThemeToggle />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Language</span>
                        <LocaleToggle />
                      </div>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search bar - Expandable */}
          {searchOpen && (
            <div className="pb-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="search" placeholder="Search products..." className="pl-10 pr-10" autoFocus />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
