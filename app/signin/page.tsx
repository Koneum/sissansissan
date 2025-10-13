"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const { t } = useLocale()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signIn(email, password)
      router.push("/")
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (role: "user" | "admin") => {
    setIsLoading(true)
    try {
      await signIn(role === "admin" ? "admin@cozy.com" : "user@cozy.com", "password")
      router.push(role === "admin" ? "/admin/dashboard" : "/")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-0 md:gap-8 items-start">
        {/* Left Panel - Login Form */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.4),0_10px_40px_rgba(0,0,0,0.25)] p-8 md:p-12 z-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
              Welcome <span className="font-bold">back</span>
            </h1>
            <p className="text-slate-300 text-sm mb-8">Sign in to your account below.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-white text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="classicdesign@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-transparent border-2 border-slate-400 text-white placeholder:text-slate-400 rounded-xl h-12 focus:border-teal-400 focus:ring-teal-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-white text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-transparent border-2 border-slate-400 text-white placeholder:text-slate-400 rounded-xl h-12 focus:border-teal-400 focus:ring-teal-400"
                />
              </div>


              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-400 hover:bg-teal-500 text-slate-900 font-semibold rounded-xl h-12 text-base"
              >
                {isLoading ? "Signing in..." : t.auth.signIn}
              </Button>

              <Button variant="secondary" onClick={() => handleQuickLogin("user")} disabled={isLoading}>
                {t.auth.quickUserLogin}
              </Button>
            </form>

            <div className="text-center flex justify-between mt-8">
              <Link href="/forgot-password" className="text-white text-sm hover:text-teal-400 transition-colors">
                Forgot Password ?
              </Link>
              <Link href="/" className="text-white text-sm hover:text-teal-400 transition-colors">
                Annuler
              </Link>
            </div>
          </div>
        </div>

        {/* Right Panel - Promotional Content */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden mt-8 md:mt-32">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-teal-400 font-bold text-lg">Design Learn</h2>
                <p className="text-slate-500 text-xs">Learning system</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-light text-slate-900 mb-2">
                Build the <span className="bg-slate-900 text-white px-2 py-1 font-bold">Skills</span>
              </h3>
              <p className="text-slate-700 text-lg">
                You need to deliver <span className="font-bold">results</span>
              </p>
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                variant="outline"
                className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl px-8 bg-transparent"
              >
                Register
              </Button>
              <Button variant="default" onClick={() => handleQuickLogin("admin")} disabled={isLoading}>
                {t.auth.quickAdminLogin}
              </Button>
            </div>
          </div>

          {/* Hero Image */}
         
        </div>
      </div>
    </div>
  )
}
