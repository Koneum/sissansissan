"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Page intermédiaire après login Apple
 * Vérifie la session et redirige
 */
export default function AuthCompletePage() {
  const router = useRouter()
  const [error, setError] = useState("")

  useEffect(() => {
    async function completeAuth() {
      try {
        // Récupérer la redirection depuis l'URL
        const params = new URLSearchParams(window.location.search)
        const redirect = params.get('redirect') || '/'

        // Vérifier la session via l'API
        const res = await fetch('/api/auth/me', {
          credentials: 'include'
        })

        if (!res.ok) {
          setError("Session invalide. Veuillez vous reconnecter.")
          setTimeout(() => router.push('/signin'), 2000)
          return
        }

        const data = await res.json()

        if (data.user) {
          console.log('✅ Session validée pour:', data.user.email)
          // Forcer un rechargement complet pour synchroniser l'état
          window.location.replace(redirect)
        } else {
          setError("Erreur lors de la récupération des données")
          setTimeout(() => router.push('/signin'), 2000)
        }
      } catch (err) {
        console.error('Auth complete error:', err)
        setError("Erreur de connexion")
        setTimeout(() => router.push('/signin'), 2000)
      }
    }

    completeAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Connexion en cours...</p>
          </>
        )}
      </div>
    </div>
  )
}
