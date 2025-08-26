"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import {
  requestPasswordResetStart,
  requestPasswordResetSuccess,
  requestPasswordResetFailure,
  clearAuthError,
} from "@/lib/features/auth/auth-slice"
import api from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Mail, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isEmailSent, setIsEmailSent] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(requestPasswordResetStart())
    dispatch(clearAuthError())
    
    try {
      const response = await api.post("/auth/request-password-reset", { email })
      
      if (response.data.success) {
        dispatch(requestPasswordResetSuccess(response.data.data.resetToken))
        setIsEmailSent(true)
        toast.success("Reset code sent! Check your email.")
        setTimeout(() => {
          router.push("/reset-password")
        }, 2000)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to send reset code"
      dispatch(requestPasswordResetFailure(errorMessage))
      toast.error(errorMessage)
    }
  }

  if (isEmailSent) {
    return (
      <div className="w-full max-w-md space-y-6">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
              Email Sent!
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              We've sent a reset code to your email address. You'll be redirected to the reset page shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 text-center">
                Check your email for the 6-digit reset code
              </p>
            </div>
            <Button
              onClick={() => router.push("/reset-password")}
              className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white font-semibold"
            >
              Go to Reset Password
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Don't worry! Enter your email address and we'll send you a reset code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending Reset Code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          If you don't receive the email, check your spam folder or contact your system administrator.
        </p>
      </div>
    </div>
  )
}