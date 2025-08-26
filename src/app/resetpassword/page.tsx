"use client"

export const dynamic = "force-dynamic"


import { ResetPasswordForm } from "@/components/auth/resetpasswordform"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/5 via-indigo-600/5 to-blue-600/5"></div>
      <div className="relative z-10">
        <ResetPasswordForm />
      </div>
    </div>
  )
}