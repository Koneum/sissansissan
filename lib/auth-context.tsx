"use client"

import type React from "react"
import { createContext, useContext } from "react"
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

  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as any).role as "CUSTOMER" | "PERSONNEL" | "MANAGER" | "ADMIN" | "SUPER_ADMIN"
  } : null

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
    await betterAuthSignOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isPending,
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



