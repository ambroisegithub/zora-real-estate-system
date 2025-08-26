"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import {
  Users,
  Building2,
  TrendingUp,
  Calendar,
  FileText,
  DollarSign,
  MapPin,
  UserPlus,
  BarChart3,
  Settings,
  Bell,
  Clock,
  ChevronRight,
  Home,
  X,
  LogOut,
  Menu,
  User,
  Shield,
  Search,
  Globe,
  Camera,
  MessageCircle,
  Eye,
  Plus,
  Star,
  Award,
  Calculator
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard/owner",
    icon: BarChart3,
  },
  {
    title: "Properties",
    icon: Building2,
    subItems: [
      { title: "All Properties", href: "/dashboard/owner/properties" },
      { title: "Add Property", href: "/dashboard/owner/properties/create" },
    ]
  },



  {
    title: "Job",
    icon: DollarSign,
    subItems: [
      { title: "Create Job", href: "/dashboard/owner/job/create" },
      { title: "All Jobs", href: "/dashboard/owner/job" },
      { title: "Applications", href: "/dashboard/owner/job/applications" },
      { title: "Interviews", href: "/dashboard/owner/job/interviews" },
      { title: "Hired Candidates", href: "/dashboard/owner/job/hired" },
    ]
  },


  {
    title: "Services",
    icon: Shield,
    subItems: [
      { title: "All Services", href: "/dashboard/owner/services" },
      { title: "Add Service", href: "/dashboard/owner/services/create" },
    ]
  },
  {
    title: "Contact Us",
    icon: MessageCircle,
    subItems: [
      { title: "Inquiries", href: "/dashboard/owner/contact" },
    ]
  }
]

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration by ensuring client-only rendering for dynamic content
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "owner") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
    }
    router.push("/login")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleExpanded = (title: string) => {
    setExpandedItem(expandedItem === title ? null : title)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  if (!isAuthenticated || user?.role !== "owner") {
    return null
  }

  // Prevent hydration mismatch by not rendering mobile-dependent content until mounted
  if (!isMounted) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-lg">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-green-900 via-yellow-800 to-green-800 dark:from-white dark:via-yellow-200 dark:to-green-200 bg-clip-text text-transparent">
                    Zola Real Estate
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Owner Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-green-50/50 via-yellow-50/30 to-green-50/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Fixed Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-900 via-yellow-800 to-green-800 dark:from-white dark:via-yellow-200 dark:to-green-200 bg-clip-text text-transparent">
                  Zola Real Estate
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Owner Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
            >
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">5</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="relative"
            >
              <MessageCircle className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">2</span>
              </div>
            </Button>

            {/* Profile Dropdown */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {user?.name?.charAt(0) || 'Z'}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
              </Button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200 dark:border-gray-700">
                <div className="py-1">
                  <Link href="/dashboard/owner/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <aside
          className={`fixed top-12 left-0 z-40 h-[calc(100vh-3rem)] w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 via-yellow-500 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 via-yellow-600 to-green-700 bg-clip-text text-transparent">
                  Zola Dashboard
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Real Estate Pro</p>
              </div>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Scrollable Sidebar Content */}
          <nav className="h-[calc(100%-4rem)] overflow-y-auto custom-scrollbar pb-10">
            <div className="p-2 space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="space-y-1">
                  {item.href ? (
                    <Link href={item.href} onClick={closeSidebar}>
                      <div className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50 dark:hover:from-green-900/20 dark:hover:to-yellow-900/20 transition-all duration-200 cursor-pointer">
                        <div className="p-1.5 rounded-md bg-gradient-to-br from-green-100 to-yellow-100 dark:from-green-900/30 dark:to-yellow-900/30 group-hover:from-green-200 group-hover:to-yellow-200 transition-all duration-200">
                          <item.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className="group w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50 dark:hover:from-green-900/20 dark:hover:to-yellow-900/20 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-gradient-to-br from-green-100 to-yellow-100 dark:from-green-900/30 dark:to-yellow-900/30 group-hover:from-green-200 group-hover:to-yellow-200 transition-all duration-200">
                            <item.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {item.title}
                          </span>
                        </div>
                        <div className={`transition-transform duration-200 ${expandedItem === item.title ? 'rotate-90' : ''}`}>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-500" />
                        </div>
                      </button>
                      {expandedItem === item.title && item.subItems && (
                        <div className="ml-8 space-y-1 animate-slide-in-up">
                          {item.subItems.map((subItem) => (
                            <Link key={subItem.href} href={subItem.href} onClick={closeSidebar}>
                              <div className="group flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gradient-to-r hover:from-green-25 hover:to-yellow-25 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all duration-200 cursor-pointer">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-yellow-400 group-hover:scale-125 transition-transform" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                  {subItem.title}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-green-50/50 via-yellow-50/30 to-green-50/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50">
          <div className="p-6 animate-fade-in-scale">
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.5);
        }
        
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.3s ease-out;
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}