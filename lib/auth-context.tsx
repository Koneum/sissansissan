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
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: any; data?: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: any; data?: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const [fallbackUser, setFallbackUser] = useState<User | null>(null)
  const [fallbackLoading, setFallbackLoading] = useState(false)

  // Fallback: vérifier via /api/auth/me si Better Auth ne trouve pas de session
  useEffect(() => {
    if (!isPending && !session?.user && !fallbackUser && !fallbackLoading) {
      setFallbackLoading(true)
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
  }, [isPending, session, fallbackUser, fallbackLoading])

  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as any).role as "CUSTOMER" | "PERSONNEL" | "MANAGER" | "ADMIN" | "SUPER_ADMIN"
  } : fallbackUser

  const handleSignIn = async (email: string, password: string, rememberMe?: boolean) => {
    try {
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

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      const result = await betterAuthSignUp.email({
        email,
        password,
        name,
      })
      return result
    } catch (error) {
      return { error }
    }
  }

  const handleSignOut = async () => {
    setFallbackUser(null)
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



