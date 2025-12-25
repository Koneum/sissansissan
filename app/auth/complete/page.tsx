"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Page intermédiaire après login Apple
 * Force la synchronisation de la session côté client
 */
export default function AuthCompletePage() {
  const router = useRouter()

  useEffect(() => {
    // Récupérer la redirection depuis l'URL
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect') || '/'

    // Forcer le rechargement complet pour que Better Auth détecte la session
    // via le cookie créé par notre callback Apple
    window.location.replace(redirect)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Connexion en cours...</p>
      </div>
    </div>
  )
}
