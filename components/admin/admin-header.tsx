"use client"

import { Home, User, Settings, LogOut, ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { ThemeToggle } from "../theme-toggle"
import { LocaleToggle } from "../locale-toggle"

interface AdminHeaderProps {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, signOut } = useAuth()
  const { t } = useLocale()

  return (
    <header className="bg-background border-b sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:scale-110 transition-transform hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="icon-responsive" />
          </Button>
          <h1 className="heading-responsive-h2 text-gray-900 dark:text-foreground truncate">{t.admin.dashboard}</h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Home className="icon-responsive" />
              <span className="hidden sm:inline">{t.nav.home}</span>
            </Button>
          </Link>

          <LocaleToggle />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs bg-primary text-white">
                    {user?.name?.[0]?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline font-medium">{t.nav.account}</span>
                <ChevronDown className="icon-responsive" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="text-responsive-sm font-medium">{user?.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role || "Administrator"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="cursor-pointer">
                  <Home className="icon-responsive mr-2" />
                  {t.admin.dashboard}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="cursor-pointer">
                  <User className="icon-responsive mr-2" />
                  Mon Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  <Settings className="icon-responsive mr-2" />
                  {t.admin.settings}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                <LogOut className="icon-responsive mr-2" />
                {t.account.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
