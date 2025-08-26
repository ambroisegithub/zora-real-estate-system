"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { loginStart, loginSuccess, loginFailure } from "@/lib/features/auth/auth-slice"
import api from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, EyeOff, Home, Shield, Users, TrendingUp, MapPin, Building } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function LoginForm() {
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const getDashboardRoute = (role: string) => {
    switch (role) {
      case "owner":
        return "/dashboard/owner"
      default:
        return "/dashboard"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(loginStart())
    try {
      const response = await api.post("/auth/login", { email, password })
      if (response.data.success) {
        dispatch(loginSuccess(response.data.data))
        toast.success("Login successful!")

        const dashboardRoute = getDashboardRoute(response.data.data.user.role)
        router.push(dashboardRoute)
      } else {
        dispatch(loginFailure({ message: response.data.message || "Login failed" }))
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred"
      const requiresReset = err.response?.data?.requires_password_reset || false
      const userId = err.response?.data?.user_id || null

      dispatch(loginFailure({ message: errorMessage, requiresPasswordReset: requiresReset, userId }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xlg space-y-6">
        {/* Logo/Brand Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Home className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-yellow-600 to-green-700 bg-clip-text text-transparent">
              Zola Real Estate
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Rwanda Investment Experts - Owner Portal
            </p>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
              Owner Login
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Access your real estate management dashboard
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
                    placeholder="Enter your email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                  />
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                  />
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-600 via-yellow-500 to-green-700 hover:from-green-700 hover:via-yellow-600 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link 
                href="/forgotpassword" 
                className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <Building className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
            <p className="text-xs text-green-700 dark:text-green-300 font-medium">Property Management</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Investment Analytics</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Rwanda Market Expert</p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="text-center text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-green-600" />
                <span>RDB Licensed</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-blue-600" />
                <span>1200+ Clients</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-yellow-600" />
                <span>500+ Properties</span>
              </div>
            </div>
            <p className="text-gray-500">Trusted Real Estate Consultancy in Rwanda</p>
          </div>
        </div>
      </div>
    </div>
  )
}