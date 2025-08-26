"use client"

export const dynamic = "force-dynamic"

import { ForgotPasswordForm } from "@/components/auth/forgotpasswordform"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-600/5 via-red-600/5 to-pink-600/5"></div>
      <div className="relative z-10">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}