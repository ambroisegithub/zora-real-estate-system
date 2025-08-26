"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import {
  verifyOTPStart,
  verifyOTPSuccess,
  verifyOTPFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  clearAuthError,
} from "@/lib/features/auth/auth-slice"
import api from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Shield, Eye, EyeOff, CheckCircle, KeyRound } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function ResetPasswordForm() {
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error, resetToken, requiresPasswordReset } = useSelector(
    (state: RootState) => state.auth
  )
  const router = useRouter()

  useEffect(() => {
    if (requiresPasswordReset && !resetToken) {
      toast.info("Please request a password reset code first.")
      router.push("/forgotpassword")
    }
  }, [requiresPasswordReset, resetToken, router])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(verifyOTPStart())
    dispatch(clearAuthError())
    
    if (!resetToken) {
      toast.error("No reset token found. Please request a password reset first.")
      router.push("/forgotpassword")
      return
    }
    
    try {
      const response = await api.post("/auth/verify-otp", { resetToken, otp })
      
      if (response.data.success) {
        dispatch(verifyOTPSuccess(response.data.data.resetToken))
        toast.success("OTP verified! Now set your new password.")
        setStep(2)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Invalid OTP"
      dispatch(verifyOTPFailure(errorMessage))
      toast.error(errorMessage)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(resetPasswordStart())
    dispatch(clearAuthError())
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.")
      return
    }
    
    if (!resetToken) {
      toast.error("No verified reset token found. Please restart the process.")
      router.push("/forgotpassword")
      return
    }
    
    try {
      const response = await api.post("/auth/resetpassword", { resetToken, newPassword })
      
      if (response.data.success) {
        dispatch(resetPasswordSuccess())
        setIsSuccess(true)
        toast.success("Password reset successfully!")
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to reset password"
      dispatch(resetPasswordFailure(errorMessage))
      toast.error(errorMessage)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
              Password Reset Successful!
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Your password has been updated successfully. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 text-center">
                Redirecting to login page in a few seconds...
              </p>
            </div>
            <Button
              onClick={() => router.push("/login")}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
            >
              Go to Login Now
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
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
            {step === 1 ? (
              <Shield className="w-8 h-8 text-white" />
            ) : (
              <KeyRound className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
            {step === 1 ? "Verify Reset Code" : "Set New Password"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {step === 1 
              ? "Enter the 6-digit code sent to your email address." 
              : "Create a strong new password for your account."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest h-14 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Check your email for the verification code
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying Code...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    className="pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    className="pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">Password requirements:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3 h-3" />
                    8+ characters
                  </div>
                  <div className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3 h-3" />
                    Uppercase letter
                  </div>
                  <div className={`flex items-center gap-1 ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3 h-3" />
                    Lowercase letter
                  </div>
                  <div className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3 h-3" />
                    Number
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 8}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          )}

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
    </div>
  )
}