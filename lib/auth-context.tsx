"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSession, signIn as betterAuthSignIn, signOut as betterAuthSignOut, signUp as betterAuthSignUp } from "./auth-client"

interface User {
  id: string
  email: string
  name: string
  role: "CUSTOMER" | "PERSONNEL" | "MANAGER" | "ADMIN" | "SUPER_ADMIN"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ error?: any; data?: any }>
  signUp: (phone: string, email: string | null, password: string, name: string) => Promise<{ error?: any; data?: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const [fallbackUser, setFallbackUser] = useState<User | null>(null)
  const [fallbackLoading, setFallbackLoading] = useState(false)
  const [fallbackTried, setFallbackTried] = useState(false)

  // Fallback: vérifier via /api/auth/me si Better Auth ne trouve pas de session
  useEffect(() => {
    if (!isPending && !session?.user && !fallbackUser && !fallbackLoading && !fallbackTried) {
      setFallbackLoading(true)
      setFallbackTried(true)
      fetch('/api/auth/me', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.user) {
            setFallbackUser({
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role || 'CUSTOMER'
            })
          }
        })
        .catch(() => {})
        .finally(() => setFallbackLoading(false))
    }
  }, [isPending, session, fallbackUser, fallbackLoading, fallbackTried])

  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as any).role as "CUSTOMER" | "PERSONNEL" | "MANAGER" | "ADMIN" | "SUPER_ADMIN"
  } : fallbackUser

  const normalizePhone = (v: string) => String(v || "").replace(/\D/g, "")
  const isEmail = (v: string) => v.includes("@")

  const handleSignIn = async (identifier: string, password: string, rememberMe?: boolean) => {
    try {
      let email = String(identifier || "").trim()

      if (!isEmail(email)) {
        const phone = normalizePhone(email)
        const res = await fetch("/api/auth/phone-to-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data?.email) {
          return { error: new Error(data?.error || "Compte introuvable") }
        }
        email = String(data.email)
      }

      const result = await betterAuthSignIn.email({
        email,
        password,
        rememberMe: rememberMe ?? false, // Session prolongée si coché
      })
      return result
    } catch (error) {
      return { error }
    }
  }

  const handleSignUp = async (phone: string, email: string | null, password: string, name: string) => {
    try {
      const normalizedPhone = normalizePhone(phone)
      if (!normalizedPhone) {
        return { error: new Error("Téléphone requis") }
      }

      const fallbackEmail = `phone-${normalizedPhone}@sissan.local`
      const signupEmail = (email && email.trim()) ? email.trim() : fallbackEmail

      const result = await betterAuthSignUp.email({
        email: signupEmail,
        password,
        name,
      })

      if ((result as any)?.error) {
        return result as any
      }

      await fetch("/api/auth/profile/phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      })

      return result
    } catch (error) {
      return { error }
    }
  }

  const handleSignOut = async () => {
    setFallbackUser(null)
    setFallbackTried(false)
    await betterAuthSignOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isPending || fallbackLoading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        isAdmin: user ? ['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) : false,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}



