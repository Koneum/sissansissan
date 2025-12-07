"use client"

import { useEffect, useCallback, useRef } from "react"
import { useAuth } from "./auth-context"
import { toast } from "sonner"

const ADMIN_INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes en millisecondes
const WARNING_BEFORE_LOGOUT = 2 * 60 * 1000 // Avertissement 2 minutes avant

export function useAdminInactivity() {
  const { user, signOut, isAdmin } = useAuth()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const hasWarnedRef = useRef(false)

  const resetTimer = useCallback(() => {
    // Ne s'applique qu'aux admins
    if (!isAdmin) return

    // Réinitialiser le flag d'avertissement
    hasWarnedRef.current = false

    // Effacer les anciens timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)

    // Timer d'avertissement (2 min avant déconnexion)
    warningRef.current = setTimeout(() => {
      if (!hasWarnedRef.current) {
        hasWarnedRef.current = true
        toast.warning("Vous serez déconnecté dans 2 minutes pour inactivité", {
          duration: 10000,
          description: "Bougez la souris ou tapez pour rester connecté"
        })
      }
    }, ADMIN_INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT)

    // Timer de déconnexion
    timeoutRef.current = setTimeout(async () => {
      toast.error("Session expirée pour inactivité", {
        description: "Vous avez été déconnecté après 30 minutes d'inactivité"
      })
      await signOut()
    }, ADMIN_INACTIVITY_TIMEOUT)
  }, [isAdmin, signOut])

  useEffect(() => {
    // Ne s'applique qu'aux admins connectés
    if (!user || !isAdmin) return

    // Événements à surveiller pour détecter l'activité
    const events = [
      "mousedown",
      "mousemove", 
      "keydown",
      "scroll",
      "touchstart",
      "click"
    ]

    // Fonction de gestion d'événement avec throttling
    let lastActivity = Date.now()
    const handleActivity = () => {
      const now = Date.now()
      // Throttle: ne réinitialiser que toutes les 5 secondes max
      if (now - lastActivity > 5000) {
        lastActivity = now
        resetTimer()
      }
    }

    // Démarrer le timer initial
    resetTimer()

    // Ajouter les écouteurs d'événements
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Nettoyer lors du démontage
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [user, isAdmin, resetTimer])

  return { resetTimer }
}



