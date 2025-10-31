"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugSessionPage() {
  const { user, isLoading } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [apiSessionData, setApiSessionData] = useState<any>(null)

  useEffect(() => {
    fetchApiSession()
  }, [])

  const fetchApiSession = async () => {
    try {
      const response = await fetch('/api/auth/get-session')
      const data = await response.json()
      setApiSessionData(data)
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">🔍 Debug Session</h1>

      {/* Auth Context */}
      <Card>
        <CardHeader>
          <CardTitle>1. Auth Context (useAuth)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
            {user && (
              <>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p className="text-lg"><strong>Role:</strong> <span className="bg-yellow-200 px-2 py-1 rounded">{user.role || 'UNDEFINED'}</span></p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Session */}
      <Card>
        <CardHeader>
          <CardTitle>2. API Session (/api/auth/get-session)</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchApiSession} className="mb-4">
            Refresh API Session
          </Button>
          {apiSessionData ? (
            <div className="space-y-2">
              <p><strong>User:</strong> {apiSessionData.user ? 'Found' : 'Not found'}</p>
              {apiSessionData.user && (
                <>
                  <p><strong>ID:</strong> {apiSessionData.user.id}</p>
                  <p><strong>Name:</strong> {apiSessionData.user.name}</p>
                  <p><strong>Email:</strong> {apiSessionData.user.email}</p>
                  <p className="text-lg"><strong>Role:</strong> <span className="bg-yellow-200 px-2 py-1 rounded">{apiSessionData.user.role || 'UNDEFINED'}</span></p>
                </>
              )}
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold">Full API Response</summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">
                  {JSON.stringify(apiSessionData, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>

      {/* Raw Session Data */}
      <Card>
        <CardHeader>
          <CardTitle>3. Diagnostic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">✅ Checklist:</h3>
              <ul className="space-y-1">
                <li>✓ User logged in: {user ? '✅' : '❌'}</li>
                <li>✓ Role in Auth Context: {user?.role ? '✅ ' + user.role : '❌ UNDEFINED'}</li>
                <li>✓ Role in API: {apiSessionData?.user?.role ? '✅ ' + apiSessionData.user.role : '❌ UNDEFINED'}</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">🎯 Expected Behavior:</h3>
              <p className="text-sm">
                For user <code className="bg-white px-1">test@sissan.com</code>, 
                the role should be <code className="bg-white px-1">MANAGER</code>
              </p>
            </div>

            {user?.role && user.role !== 'CUSTOMER' && (
              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-semibold mb-2">✅ Role Detected!</h3>
                <p className="text-sm">
                  Role <code className="bg-white px-1">{user.role}</code> should redirect to <code className="bg-white px-1">/admin</code>
                </p>
              </div>
            )}

            {user && !user.role && (
              <div className="p-4 bg-red-50 rounded">
                <h3 className="font-semibold mb-2">❌ Problem Detected!</h3>
                <p className="text-sm">
                  Role is UNDEFINED. Better Auth is not returning the role field.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Login with <code className="bg-gray-100 px-1">test@sissan.com</code></li>
            <li>Come back to this page: <code className="bg-gray-100 px-1">/debug-session</code></li>
            <li>Check if the role is displayed correctly</li>
            <li>If role is UNDEFINED, we need to fix Better Auth configuration</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
