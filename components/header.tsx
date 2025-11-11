"use client"

import Link from "next/link"
import { Search, User, Heart, ShoppingCart, Menu, X, Home, Store, FileText, BookOpen, Mail, LogOut, LogIn } from "lucide-react"
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
import { Separator } from "./ui/separator"
import { SearchWithSuggestions } from "./search-with-suggestions"

export function Header() {
  const { itemCount } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const { user, signOut } = useAuth()
  const { t } = useLocale()
  const { headerData } = useHeader()
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Top banner */}
      {headerData.topBannerEnabled && (
        <div className="bg-primary text-primary-foreground text-center py-2 sm:py-2.5 text-xs sm:text-sm px-3 sm:px-4">
          <p className="animate-in fade-in slide-in-from-top-2 duration-500 truncate">{headerData.topBannerText}</p>
        </div>
      )}

      {/* Main header */}
      <header className="border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 gap-2 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 -ml-2 sm:ml-0">
              <img
                src={headerData.logoUrl}
                alt="Zissan-Sissan"
                className="h-12 sm:h-16 md:h-20 w-auto"
              />
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-4 lg:gap-6 xl:gap-8">
              <Link href="/" className="text-responsive-sm font-medium hover:text-primary transition-colors relative group">
                {t.nav.home}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link href="/shop" className="text-responsive-sm font-medium hover:text-primary transition-colors relative group">
                {t.nav.shop}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link
                href="/products"
                className="text-responsive-sm font-medium hover:text-primary transition-colors relative group"
              >
                {t.nav.pages}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link href="/blog" className="text-responsive-sm font-medium hover:text-primary transition-colors relative group">
                {t.nav.blog}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link href="/contact" className="text-responsive-sm font-medium hover:text-primary transition-colors relative group">
                {t.nav.contact}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              {/* Search - Desktop */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex hover:scale-110 transition-transform"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="icon-responsive" />
              </Button>

              {/* User - Desktop */}
              <div className="hidden sm:block">
                <Link href={user ? "/account" : "/signin"}>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={user ? "Mon Compte" : t.auth.signIn}
                    className="hover:scale-110 transition-transform"
                  >
                    <User className="icon-responsive" />
                  </Button>
                </Link>
              </div>

              {/* Wishlist - Desktop */}
              <Link href="/wishlist" className="hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:scale-110 transition-transform"
                >
                  <Heart className="icon-responsive" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-in zoom-in duration-300">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:scale-110 transition-transform"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="icon-responsive" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-in zoom-in duration-300">
                    {itemCount}
                  </span>
                )}
              </Button>

              {/* Theme & Locale - Desktop */}
              <div className="hidden md:flex items-center gap-1">
                <ThemeToggle />
                <LocaleToggle />
              </div>

              {/* Mobile menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden hover:scale-110 transition-transform">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[380px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                      <h2 className="text-lg font-semibold">Menu</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(false)}
                        className="hover:scale-110 transition-transform"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-1">
                        <Link
                          href="/"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <Home className="icon-responsive text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-responsive-sm font-medium">{t.nav.home}</span>
                        </Link>
                        <Link
                          href="/shop"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <Store className="icon-responsive text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-responsive-sm font-medium">{t.nav.shop}</span>
                        </Link>
                        <Link
                          href="/products"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <FileText className="icon-responsive text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-responsive-sm font-medium">{t.nav.pages}</span>
                        </Link>
                        <Link
                          href="/blog"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <BookOpen className="icon-responsive text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-responsive-sm font-medium">{t.nav.blog}</span>
                        </Link>
                        <Link
                          href="/contact"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <Mail className="icon-responsive text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-responsive-sm font-medium">{t.nav.contact}</span>
                        </Link>
                      </div>

                      <Separator className="my-6" />

                      {/* Quick Actions */}
                      <div className="space-y-1">
                        <Link
                          href="/wishlist"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Heart className="icon-responsive text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-responsive-sm font-medium">Wishlist</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>

                        {/* Search - Mobile */}
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false)
                            setSearchOpen(true)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="font-medium">Search</span>
                        </button>
                      </div>

                      <Separator className="my-6" />

                      {/* User Actions */}
                      <div className="space-y-1">
                        {user ? (
                          <>
                            <Link
                              href="/account"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                            >
                              <User className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span className="font-medium">Mon Compte</span>
                            </Link>
                            <button
                              onClick={() => {
                                signOut()
                                setMobileMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                            >
                              <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span className="font-medium">{t.auth.signOut}</span>
                            </button>
                          </>
                        ) : (
                          <Link
                            href="/signin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                          >
                            <LogIn className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="font-medium">{t.auth.signIn}</span>
                          </Link>
                        )}
                      </div>
                    </nav>

                    {/* Footer Settings */}
                    <div className="border-t p-6 space-y-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Theme</span>
                        </div>
                        <ThemeToggle />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Language</span>
                        </div>
                        <LocaleToggle />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search bar - Expandable with Suggestions */}
          {searchOpen && (
            <SearchWithSuggestions onClose={() => setSearchOpen(false)} />
          )}
        </div>
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
