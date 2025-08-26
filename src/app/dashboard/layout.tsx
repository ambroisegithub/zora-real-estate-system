"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated && user) {
      const currentPath = window.location.pathname

      // Only redirect if user is on the main dashboard page
      if (currentPath === "/dashboard") {
        switch (user.role) {
          case "owner":
            router.replace("/dashboard/owner")  // Use replace instead of push
            break
          default:
            // Fallback for unknown roles
            router.push("/login")
            break
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-yellow-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Zola Real Estate</h2>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-yellow-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Redirecting...</h2>
          <p className="text-gray-600">Please wait while we redirect you to login.</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting from main dashboard page
  if (user && typeof window !== 'undefined' && window.location.pathname === "/dashboard") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-yellow-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Zola Real Estate</h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}