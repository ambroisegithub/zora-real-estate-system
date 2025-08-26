
"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, MapPin, Phone, Mail, Star, TrendingUp, Shield, Award, Users, 
  Search, ArrowRight, CheckCircle, Globe, Smartphone, Clock, DollarSign, 
  BarChart3, FileText, Calendar, MessageCircle, Menu, X, ArrowLeft, Heart, 
  Target, Lightbulb, Send, Briefcase, Home, Building, Calculator,
  Loader2, AlertCircle, Eye, ChevronRight, Filter, Plus, Video, User, Upload
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import Image from 'next/image'

// Import Redux slices
import { 
  fetchFeaturedProperties, 
  selectProperties, 
  selectPropertiesLoading  
} from '@/lib/features/auth/PropertiesSlice'
import { 
  fetchServices, 
  selectServices, 
  selectServicesLoading 
} from '@/lib/features/auth/ServiceSlice'
import {
  fetchNews,
  selectNews,
  selectNewsletterLoading,
  fetchNewsById,
  selectCurrentNews,
  sendNewsletter
} from '@/lib/features/auth/newsletterSlice'
import {
  createContact,
  subscribeNewsletter,
  clearError as clearContactError
} from '@/lib/features/auth/ContactUsSlice'
import {
  fetchJobs,
  selectJobs,
  selectJobsLoading
} from '@/lib/features/auth/jobSlice'
import Link from 'next/link'

// Skeleton Loader Components
function SkeletonLoader({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200/50 rounded ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <SkeletonLoader className="h-48" />
      <div className="p-4">
        <SkeletonLoader className="h-5 mb-2 w-3/4" />
        <SkeletonLoader className="h-4 mb-3 w-1/2" />
        <SkeletonLoader className="h-6 mb-3 w-1/3" />
        <SkeletonLoader className="h-3 mb-2 w-full" />
        <SkeletonLoader className="h-3 w-2/3" />
      </div>
    </div>
  )
}

function ServiceCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-lg">
      <SkeletonLoader className="w-12 h-12 rounded-lg mb-4" />
      <SkeletonLoader className="h-5 mb-3 w-3/4" />
      <SkeletonLoader className="h-3 mb-2 w-full" />
      <SkeletonLoader className="h-3 w-2/3" />
    </div>
  )
}

function NewsCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-lg">
      <SkeletonLoader className="h-32 mb-4 rounded-lg" />
      <SkeletonLoader className="h-5 mb-2 w-3/4" />
      <SkeletonLoader className="h-3 mb-3 w-full" />
      <SkeletonLoader className="h-3 w-1/2" />
    </div>
  )
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    let start = 0
    const increment = end / (duration / 16)
    
    function update() {
      start += increment
      if (start < end) {
        setCount(Math.floor(start))
        ref.current = setTimeout(update, 16)
      } else {
        setCount(end)
      }
    }
    
    update()
    return () => {
      if (ref.current) clearTimeout(ref.current)
    }
  }, [end, duration])

  return <span>{count.toLocaleString()}{suffix}</span>
}

// Typing Animation Component
function TypingAnimation({ texts, speed = 100 }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fullText = texts[currentTextIndex]

      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1))
        if (currentText === '') {
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1))
        if (currentText === fullText) {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      }
    }, isDeleting ? speed / 2 : speed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentTextIndex, texts, speed])

  return <span className="border-r-2 border-white animate-pulse">{currentText}</span>
}

// News Detail Modal Component
function NewsDetailModal({ news, isOpen, onClose, onSendNewsletter }) {
  const [isSending, setIsSending] = useState(false)
  
  const handleSendNewsletter = async () => {
    if (!news?.news_id) return
    
    setIsSending(true)
    try {
      await onSendNewsletter(news.news_id)
      onClose()
    } catch (error) {
      console.error('Failed to send newsletter:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen || !news) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-[#0A1628]">{news.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 bg-[#87CEEB] text-white text-xs font-semibold rounded-full">
                {news.category.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-600">
                {new Date(news.created_at).toLocaleDateString()}
              </span>
              <span className="text-sm text-gray-600">
                {news.read_time || '3 min read'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {news.featured_image && (
            <div className="w-full h-64 md:h-80 relative">
              <Image
                src={news.featured_image}
                alt={news.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-[#87CEEB]">
                <h3 className="text-lg font-semibold text-[#0A1628] mb-2">Summary</h3>
                <p className="text-gray-700">{news.summary}</p>
              </div>
              
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {news.content}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>Views: {news.view_count || 0}</p>
                  {news.last_sent_at && (
                    <p>Last sent: {new Date(news.last_sent_at).toLocaleDateString()}</p>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSendNewsletter}
                    disabled={isSending || news.status === 'published'}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      news.status === 'published'
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-[#4A90A4] text-white hover:bg-[#0A1628]'
                    } ${isSending ? 'opacity-70' : ''}`}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                        Sending...
                      </>
                    ) : news.status === 'published' ? (
                      'Already Published'
                    ) : (
                      'Send to Subscribers'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Navigation Component
function Navigation({ currentPage, setCurrentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { href: "home", label: "Home" },
    { href: "about", label: "About Us" },
    { href: "services", label: "Our Services" },
    { href: "projects", label: "Properties" },
    { href: "news", label: "Market Insights" },
    { href: "careers", label: "Careers" },
    { href: "contact", label: "Contact Us" },
    { href: "faqs", label: "FAQs" },
  ]

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-white shadow-sm">
              <Image
                src="/zolalogo.jpg"
                alt="Zola logo"
                width={80}
                height={80}
                priority
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-bold text-[#0A1628] leading-tight">Zola Real Estate</h1>
              <p className="text-xs text-gray-600 leading-tight">Rwanda Investment Experts</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => setCurrentPage(link.href)}
                className={`text-sm font-medium transition-colors relative ${
                  currentPage === link.href
                    ? 'text-[#87CEEB] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#87CEEB]'
                    : 'text-gray-700 hover:text-[#87CEEB]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    setCurrentPage(link.href)
                    setIsMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === link.href
                      ? 'text-[#87CEEB] bg-blue-50'
                      : 'text-gray-700 hover:text-[#87CEEB] hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

// Homepage Component
function HomePage({ setCurrentPage }) {
  const dispatch = useAppDispatch()
  
  // Fetch data from Redux
  const featuredProperties = useAppSelector(selectProperties)
  const propertiesLoading = useAppSelector(selectPropertiesLoading)
  
  const services = useAppSelector(selectServices)
  const servicesLoading = useAppSelector(selectServicesLoading)
  
  const news = useAppSelector(selectNews)
  const newsLoading = useAppSelector(selectNewsletterLoading)
  
  const [activeTab, setActiveTab] = useState(0)
  const [selectedNews, setSelectedNews] = useState(null)
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false)

  useEffect(() => {
    // Fetch all data on mount
    dispatch(fetchFeaturedProperties(6))
    dispatch(fetchServices({ active_only: true }))
    dispatch(fetchNews({ status: 'published', limit: 3 }))
  }, [dispatch])

  const heroTexts = [
    "Safe Property Investments in Rwanda",
    "Expert Real Estate Consultancy",
    "Your Trusted Investment Partner"
  ]

  const investmentInsights = [
    { 
      title: "Market Trends", 
      content: "Rwanda's property market grows 12% annually with strong government infrastructure investment driving demand in key districts.", 
      icon: BarChart3 
    },
    { 
      title: "Investment Tips", 
      content: "Focus on Kigali's expanding districts with upcoming infrastructure projects for maximum appreciation.", 
      icon: TrendingUp 
    },
    { 
      title: "Legal Guide", 
      content: "Foreign ownership made simple with clear documentation requirements. We handle all legal compliance.", 
      icon: FileText 
    }
  ]

  const handleNewsClick = async (newsId) => {
    try {
      await dispatch(fetchNewsById(newsId))
      const newsItem = news.find(n => n.news_id === newsId)
      setSelectedNews(newsItem)
      setIsNewsModalOpen(true)
    } catch (error) {
      console.error('Failed to fetch news details:', error)
    }
  }

  const handleSendNewsletter = async (newsId) => {
    try {
      await dispatch(sendNewsletter(newsId))
      // Refresh news list after sending
      dispatch(fetchNews({ status: 'published', limit: 3 }))
    } catch (error) {
      console.error('Failed to send newsletter:', error)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center text-white overflow-hidden mt-16">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#4A90A4] to-[#0A1628]"
          style={{ background: 'linear-gradient(135deg, #0A1628 0%, #4A90A4 50%, #0A1628 100%)' }} 
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Zola Real Estate
              <br />
              <span className="text-[#87CEEB]">
                <TypingAnimation texts={heroTexts} />
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-6 text-gray-100 max-w-3xl mx-auto">
              We simplify real estate for local and international investors with expertise, transparency, and client-first approach in Rwanda.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <button
              onClick={() => setCurrentPage('projects')}
              className="bg-white text-[#0A1628] font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Find Properties
            </button>
            <button
              onClick={() => setCurrentPage('contact')}
              className="border-2 border-white text-white font-bold py-3 px-6 rounded-full hover:bg-white hover:text-[#0A1628] transition-all duration-300"
            >
              Get Consultation
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xl font-bold"><AnimatedCounter end={500} />+</div>
              <div className="text-xs">Properties Sold</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xl font-bold"><AnimatedCounter end={1200} />+</div>
              <div className="text-xs">Happy Clients</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xl font-bold"><AnimatedCounter end={10} />+</div>
              <div className="text-xs">Years Experience</div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 animate-bounce text-white" />
        </motion.div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-gray-50 py-3 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-6 text-gray-600 text-sm overflow-x-auto">
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <Shield className="w-4 h-4 text-[#87CEEB]" />
              <span>RDB Licensed & Registered</span>
            </div>
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <Award className="w-4 h-4 text-[#4A90A4]" />
              <span>Certified Real Estate Consultancy</span>
            </div>
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <Users className="w-4 h-4 text-[#87CEEB]" />
              <span>1200+ Satisfied Clients</span>
            </div>
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <CheckCircle className="w-4 h-4 text-[#4A90A4]" />
              <span>100% Secure Transactions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-[#0A1628] mb-3">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Professional real estate solutions for your investment journey in Rwanda
            </p>
          </motion.div>
  {servicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service, index) => (
              <motion.div
                key={service.service_id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Service Image */}
                <div className="h-48 bg-gradient-to-br from-[#87CEEB] to-[#4A90A4] relative">
                  {service.image_url ? (
                    <Image
                      src={service.image_url}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TrendingUp className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  {/* Service Status Badge */}
                  {service.is_active ? (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-gray-400 text-white text-xs font-semibold rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Service Content */}
                <div className="p-5">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-[#87CEEB] rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      {service.icon_name ? (
                        <span className="text-xl text-white">{service.icon_name}</span>
                      ) : (
                        <TrendingUp className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-[#0A1628] mb-2">{service.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                    {service.description}
                  </p>
                  
                  <button
                    onClick={() => setCurrentPage('services')}
                    className="text-[#4A90A4] font-semibold hover:text-[#0A1628] transition-colors flex items-center text-sm"
                  >
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* Property Search Preview */}
      <section className="py-10 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#0A1628] mb-3">Featured Properties</h2>
            <p className="text-lg text-gray-600">Discover our premium properties in Rwanda</p>
          </div>

          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No featured properties available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProperties.slice(0, 3).map((property, index) => (
                <motion.div
                  key={property.property_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="h-48 bg-gradient-to-br from-[#87CEEB] to-[#4A90A4] flex items-center justify-center relative">
                    {property.image_urls && property.image_urls.length > 0 ? (
                      <Image
                        src={property.image_urls[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Home className="w-12 h-12 text-white opacity-50" />
                    )}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                      property.status === 'sold' ? 'bg-red-500 text-white' : 'bg-[#87CEEB] text-white'
                    }`}>
                      {property.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-[#0A1628] mb-2">{property.title}</h3>
                    <p className="text-gray-600 mb-3 flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {property.location}
                    </p>
                    <div className="mb-4">
                      <div className="text-xl font-bold text-[#4A90A4] mb-2">
                        ${property.price.toLocaleString()}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {property.bedrooms && (
                          <div className="text-xs text-gray-600">
                            {property.bedrooms} Bedrooms
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="text-xs text-gray-600">
                            {property.bathrooms} Bathrooms
                          </div>
                        )}
                        {property.area_sq_m && (
                          <div className="text-xs text-gray-600">
                            {property.area_sq_m} sq m
                          </div>
                        )}
                        <div className="text-xs text-gray-600">
                          {property.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link 
                        href={`/property/${property.property_id}`}
                        className="flex-1 bg-[#4A90A4] text-white px-3 py-2 rounded-lg hover:bg-[#0A1628] transition-colors text-sm">
                        View Details
                      </Link>
                      <button
                        onClick={() => setCurrentPage('contact')}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Inquire
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => setCurrentPage('projects')}
              className="bg-gradient-to-r from-[#87CEEB] to-[#4A90A4] text-white font-bold py-3 px-6 rounded-lg hover:from-[#4A90A4] hover:to-[#0A1628] transition-all duration-300 transform hover:scale-105"
            >
              View All Properties
            </button>
          </div>
        </div>
      </section>

      {/* Market News & Insights */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#0A1628] mb-6">Market News & Insights</h2>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <NewsCardSkeleton key={index} />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No market insights available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.slice(0, 3).map((newsItem, index) => (
                <motion.div
                  key={newsItem.news_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleNewsClick(newsItem.news_id)}
                >
                  <div className="h-32 bg-gradient-to-br from-[#87CEEB] to-[#4A90A4] rounded-lg flex items-center justify-center mb-4 relative">
                    {newsItem.featured_image ? (
                      <Image
                        src={newsItem.featured_image}
                        alt={newsItem.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-white opacity-50" />
                    )}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-[#4A90A4] text-white text-xs font-semibold rounded-full">
                      {newsItem.category.replace('_', ' ')}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A1628] mb-3 line-clamp-2">
                    {newsItem.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                    {newsItem.summary}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {new Date(newsItem.created_at).toLocaleDateString()}
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#87CEEB]" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => setCurrentPage('news')}
              className="bg-[#4A90A4] text-white px-6 py-3 rounded-lg hover:bg-[#0A1628] transition-colors font-semibold"
            >
              View All Market Insights
            </button>
          </div>
        </div>
      </section>

      {/* Investment Insights */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#0A1628] mb-6">Rwanda Investment Insights</h2>

          <div className="bg-white rounded-xl p-5 shadow-lg">
            <div className="flex flex-wrap justify-center mb-4">
              {investmentInsights.map((insight, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 py-2 rounded-lg mr-3 mb-3 font-semibold transition-all duration-300 text-sm ${
                    activeTab === index
                      ? 'bg-[#87CEEB] text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <insight.icon className="w-4 h-4 inline mr-2" />
                  {insight.title}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-5 shadow-inner">
              <h3 className="text-xl font-bold text-[#0A1628] mb-3">
                {investmentInsights[activeTab].title}
              </h3>
              <p className="text-gray-700 mb-4">
                {investmentInsights[activeTab].content}
              </p>
              <button
                onClick={() => setCurrentPage('news')}
                className="bg-[#4A90A4] text-white px-4 py-2 rounded-lg hover:bg-[#0A1628] transition-colors text-sm"
              >
                Read Full Analysis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <NewsletterSubscription />

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <NewsDetailModal
            news={selectedNews}
            isOpen={isNewsModalOpen}
            onClose={() => {
              setIsNewsModalOpen(false)
              setSelectedNews(null)
            }}
            onSendNewsletter={handleSendNewsletter}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Newsletter Subscription Component
function NewsletterSubscription() {
  const dispatch = useAppDispatch()
  const { loading, error, success } = useAppSelector((state) => state.contactUs)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearContactError())

    try {
      await dispatch(subscribeNewsletter({
        email,
        first_name: name,
        source: 'homepage_newsletter'
      })).unwrap()

      setEmail('')
      setName('')
    } catch (error) {
      console.error('Newsletter subscription error:', error)
    }
  }

  return (
    <section className="relative py-10 overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-r from-[#0A1628] via-[#4A90A4] to-[#0A1628]"
        style={{ background: 'linear-gradient(120deg, #0A1628 0%, #4A90A4 50%, #0A1628 100%)' }} 
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Subscribe to Market Insights
          </h2>
          <p className="text-lg text-gray-200 mb-6 max-w-2xl mx-auto">
            Get weekly market updates, investment opportunities, and real estate news directly to your inbox.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Successfully subscribed to our newsletter!
            </div>
          )}

          <form onSubmit={handleNewsletterSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#0A1628] font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                  Subscribing...
                </>
              ) : (
                'Subscribe Now'
              )}
            </button>
          </form>

          <p className="text-sm text-gray-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// About Page Component
function AboutPage({ setCurrentPage }) {
  const values = [
    { icon: Heart, title: "Client-First Approach", desc: "Every decision prioritizes client success" },
    { icon: Shield, title: "Trust & Transparency", desc: "Complete honesty in all transactions" },
    { icon: Lightbulb, title: "Innovation & Expertise", desc: "Local knowledge with international standards" },
    { icon: Target, title: "Results-Driven", desc: "Focused on measurable investment outcomes" }
  ]

  return (
    <div className="mt-16">
      <section className="bg-gradient-to-br from-[#0A1628] to-[#4A90A4] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">About Zola Real Estate</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Your trusted partner in Rwanda real estate investment, combining local expertise with international standards.
          </p>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0A1628] mb-4">Who We Are</h2>
              <p className="text-gray-700 mb-4">
                Zola Real Estate Consultancy Rwanda LTD is a legally registered real estate consultancy based in Kigali, Rwanda. We specialize in simplifying real estate transactions for both local and international investors.
              </p>
              <p className="text-gray-700 mb-6">
                We protect your investment and guide you through every step of the property acquisition process with complete transparency and legal compliance.
              </p>
              <button
                onClick={() => setCurrentPage('contact')}
                className="bg-[#87CEEB] text-white px-6 py-3 rounded-lg hover:bg-[#4A90A4] transition-colors"
              >
                Work With Us
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#0A1628] mb-4">Our Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#87CEEB]"><AnimatedCounter end={500} />+</div>
                  <div className="text-gray-600 text-sm">Properties Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#4A90A4]"><AnimatedCounter end={1200} />+</div>
                  <div className="text-gray-600 text-sm">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#87CEEB]">100%</div>
                  <div className="text-gray-600 text-sm">Secure Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#4A90A4]"><AnimatedCounter end={10} />+</div>
                  <div className="text-gray-600 text-sm">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#0A1628] mb-6">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-lg p-5 shadow-md text-center"
              >
                <value.icon className="w-10 h-10 text-[#87CEEB] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#0A1628] mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Services Page Component
function ServicesPage({ setCurrentPage }) {
  const dispatch = useAppDispatch()
  const services = useAppSelector(selectServices)
  const servicesLoading = useAppSelector(selectServicesLoading)

  useEffect(() => {
    dispatch(fetchServices({ active_only: true }))
  }, [dispatch])

  return (
    <div className="mt-16">
      <section className="bg-gradient-to-br from-[#0A1628] to-[#4A90A4] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-gray-200">
            Comprehensive real estate solutions for successful property investments in Rwanda.
          </p>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {servicesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
                <ServiceCardSkeleton key={index} />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No services available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.service_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  {/* Service Image */}
                  <div className="h-56 bg-gradient-to-br from-[#87CEEB] to-[#4A90A4] relative">
                    {service.image_url ? (
                      <Image
                        src={service.image_url}
                        alt={service.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TrendingUp className="w-20 h-20 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <h3 className="text-xl font-bold text-white">{service.title}</h3>
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#87CEEB] rounded-lg flex items-center justify-center mr-3">
                          {service.icon_name ? (
                            <span className="text-2xl text-white">{service.icon_name}</span>
                          ) : (
                            <TrendingUp className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            {service.is_active ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Updated: {new Date(service.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCurrentPage('contact')}
                        className="bg-[#87CEEB] text-white px-4 py-2 rounded-lg hover:bg-[#4A90A4] transition-colors text-sm font-medium"
                      >
                        Get Started
                      </button>
                      <Link
                        href={`/services/${service.service_id}`}
                        className="text-[#4A90A4] font-semibold hover:text-[#0A1628] transition-colors text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
// Properties Page Component
function PropertiesPage({ setCurrentPage }) {
  const dispatch = useAppDispatch()
  const featuredProperties = useAppSelector(selectProperties)
  const propertiesLoading = useAppSelector(selectPropertiesLoading)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchFeaturedProperties(12))
  }, [dispatch])

  const propertyTypes = ['all', 'house', 'apartment', 'villa', 'commercial', 'land', 'condo']

  const filteredProperties = filter === 'all' 
    ? featuredProperties 
    : featuredProperties.filter(p => p.type === filter)

  return (
    <div className="mt-16">
      <section className="bg-gradient-to-br from-[#0A1628] to-[#4A90A4] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Properties</h1>
          <p className="text-xl text-gray-200">
            Explore our curated selection of premium properties in Rwanda.
          </p>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center mb-6 space-x-3">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors mb-2 ${
                  filter === type
                    ? 'bg-[#87CEEB] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No properties available for this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.property_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-[#87CEEB] to-[#4A90A4] flex items-center justify-center relative">
                    {property.image_urls && property.image_urls.length > 0 ? (
                      <Image
                        src={property.image_urls[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Home className="w-12 h-12 text-white opacity-50" />
                    )}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                      property.status === 'sold' ? 'bg-red-500 text-white' : 'bg-[#87CEEB] text-white'
                    }`}>
                      {property.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-[#0A1628] mb-2">{property.title}</h3>
                    <p className="text-gray-600 mb-3 flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {property.location}
                    </p>
                    <div className="mb-4">
                      <div className="text-xl font-bold text-[#4A90A4] mb-2">
                        ${property.price.toLocaleString()}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {property.bedrooms && (
                          <div className="text-xs text-gray-600">
                            {property.bedrooms} Bedrooms
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="text-xs text-gray-600">
                            {property.bathrooms} Bathrooms
                          </div>
                        )}
                        {property.area_sq_m && (
                          <div className="text-xs text-gray-600">
                            {property.area_sq_m} sq m
                          </div>
                        )}
                        <div className="text-xs text-gray-600">
                          {property.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link 
                        href={`/property/${property.property_id}`}
                        className="flex-1 bg-[#4A90A4] text-white px-3 py-2 rounded-lg hover:bg-[#0A1628] transition-colors text-sm">
                        View Details
                      </Link>
              
                      <button
                        onClick={() => setCurrentPage('contact')}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Inquire
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// News Page Component
function NewsPage({ setCurrentPage }) {
  const dispatch = useAppDispatch()
  const news = useAppSelector(selectNews)
  const newsLoading = useAppSelector(selectNewsletterLoading)
  const [selectedNews, setSelectedNews] = useState(null)
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchNews({ status: 'published' }))
  }, [dispatch])

  const categories = ['all', 'market_trends', 'investment_opportunities', 'legal_updates', 'project_launches', 'industry_insights']

  const filteredNews = categoryFilter === 'all'
    ? news
    : news.filter(n => n.category === categoryFilter)

  const handleNewsClick = async (newsId) => {
    try {
      await dispatch(fetchNewsById(newsId))
      const newsItem = news.find(n => n.news_id === newsId)
      setSelectedNews(newsItem)
      setIsNewsModalOpen(true)
    } catch (error) {
      console.error('Failed to fetch news details:', error)
    }
  }

  const handleSendNewsletter = async (newsId) => {
    try {
      await dispatch(sendNewsletter(newsId))
      dispatch(fetchNews({ status: 'published' }))
    } catch (error) {
      console.error('Failed to send newsletter:', error)
    }
  }

  return (
    <div className="mt-16">
      <section className="bg-gradient-to-br from-[#0A1628] to-[#4A90A4] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Market News & Insights</h1>
          <p className="text-xl text-gray-200">
            Stay updated with the latest Rwanda real estate market trends and investment opportunities.
          </p>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center mb-6 space-x-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors mb-2 ${
                  categoryFilter === category
                    ? 'bg-[#87CEEB] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {newsLoading ? (
                <div className="space-y-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-lg">
                      <SkeletonLoader className="h-48 mb-4 rounded-lg" />
                      <SkeletonLoader className="h-6 mb-3 w-3/4" />
                      <SkeletonLoader className="h-3 mb-2 w-full" />
                      <SkeletonLoader className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No market insights available for this category.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredNews.map((newsItem) => (
                    <motion.div
                      key={newsItem.news_id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => handleNewsClick(newsItem.news_id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="bg-[#87CEEB] text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {newsItem.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {newsItem.read_time || '3 min read'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[#0A1628] mb-3 hover:text-[#87CEEB] transition-colors">
                        {newsItem.title}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">{newsItem.summary}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {new Date(newsItem.created_at).toLocaleDateString()}
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#87CEEB]" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <NewsletterSubscription />
              
              <div className="bg-white rounded-xl p-5 shadow-lg">
                <h3 className="text-lg font-bold text-[#0A1628] mb-4">Popular Topics</h3>
                <div className="space-y-3">
                  {categories.slice(1).map((category, i) => (
                    <button
                      key={i}
                      onClick={() => setCategoryFilter(category)}
                      className="flex items-center justify-between text-sm hover:bg-gray-50 p-2 rounded cursor-pointer w-full"
                    >
                      <span className="text-gray-700">{category.replace('_', ' ')}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <NewsDetailModal
            news={selectedNews}
            isOpen={isNewsModalOpen}
            onClose={() => {
              setIsNewsModalOpen(false)
              setSelectedNews(null)
            }}
            onSendNewsletter={handleSendNewsletter}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Careers Page Component
function CareersPage({ setCurrentPage }) {
  const dispatch = useAppDispatch()
  const jobs = useAppSelector(selectJobs)
  const jobsLoading = useAppSelector(selectJobsLoading)

  useEffect(() => {
    dispatch(fetchJobs({ status: 'active' }))
  }, [dispatch])

  return (
    <div className="mt-16">
      <section className="bg-gradient-to-br from-[#0A1628] to-[#4A90A4] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-200">
            Build your career with Rwanda's leading real estate consultancy.
          </p>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-[#0A1628] mb-6">Open Positions</h2>

              {jobsLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-5 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#0A1628] mb-2">No Open Positions</h3>
                  <p className="text-gray-600 mb-4">
                    We don't have any open positions at the moment, but we're always looking for talented people.
                  </p>
                  <button
                    onClick={() => setCurrentPage('contact')}
                    className="bg-[#87CEEB] text-white px-4 py-2 rounded-lg hover:bg-[#4A90A4] transition-colors"
                  >
                    Send Us Your Resume
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job.job_id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-[#0A1628] mb-2">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              {job.department || 'General'}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </span>
                          </div>
                        </div>
                        <span className="bg-[#87CEEB] text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {job.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm line-clamp-3">{job.description}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage('contact')}
                          className="bg-[#87CEEB] text-white px-4 py-2 rounded-lg hover:bg-[#4A90A4] transition-colors text-sm font-medium"
                        >
                          Apply Now
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-[#0A1628] mb-4">Why Work With Us?</h3>
                <ul className="space-y-3">
                  {[
                    "Competitive salary packages",
                    "Professional development opportunities",
                    "Health insurance coverage",
                    "Performance-based bonuses",
                    "Career advancement paths"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-[#87CEEB] mr-2" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-[#0A1628] mb-4">Application Process</h3>
                <div className="space-y-3">
                  {[
                    "Submit application",
                    "Initial screening",
                    "Interview process",
                    "Final decision"
                  ].map((step, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-6 h-6 bg-[#87CEEB] text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Contact Page Component
function ContactPage({ setCurrentPage }) {
  const dispatch = useAppDispatch()
  const { loading, error, success } = useAppSelector((state) => state.contactUs)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    investment_interest: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearContactError())

    try {
      await dispatch(createContact({
        ...formData,
        category: 'general_inquiry',
        source: 'website_contact_page'
      })).unwrap()

      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        investment_interest: ''
      })
    } catch (error) {
      console.error('Contact form error:', error)
    }
  }

  return (
    <div className="mt-16">
      <section className="bg-gradient-to-br from-[#0A1628] to-[#4A90A4] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-200">
            Ready to start your Rwanda property investment journey? Get in touch with our expert team.
          </p>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Your message has been sent successfully! We'll respond within 24 hours.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-[#0A1628] mb-6">Get Free Consultation</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Tell us about your investment goals..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#87CEEB] to-[#4A90A4] text-white font-bold py-3 px-6 rounded-lg hover:from-[#4A90A4] hover:to-[#0A1628] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 inline" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-[#0A1628] mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#87CEEB] rounded-lg flex items-center justify-center mr-4">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0A1628]">Email</div>
                      <div className="text-gray-600">ndisanzemarine@gmail.com</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#4A90A4] rounded-lg flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0A1628]">Phone</div>
                      <div className="text-gray-600">+250 788 XXX XXX</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#87CEEB] rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0A1628]">Office</div>
                      <div className="text-gray-600">Kigali, Rwanda</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-[#87CEEB] text-white font-bold py-3 rounded-lg hover:bg-[#4A90A4] transition-colors flex items-center justify-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  WhatsApp Consultation
                </button>
                <button className="w-full bg-[#4A90A4] text-white font-bold py-3 rounded-lg hover:bg-[#0A1628] transition-colors flex items-center justify-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Virtual Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// FAQs Page Component
function FAQsPage({ setCurrentPage }) {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      category: "General Questions",
      questions: [
        {
          q: "How long does the property buying process take in Rwanda?",
          a: "Typically 3-6 weeks depending on the property type and complexity. Our team expedites the process while ensuring all legal requirements are met."
        },
        {
          q: "Can foreigners buy property in Rwanda?",
          a: "Yes, foreigners can buy property in Rwanda. We guide you through the specific requirements and ensure full compliance with foreign ownership regulations."
        },
        {
          q: "What are your service fees?",
          a: "Our fees vary by service type and complexity. We offer transparent pricing with no hidden costs. Contact us for a detailed quote based on your specific needs."
        }
      ]
    },
    {
      category: "Investment Questions",
      questions: [
        {
          q: "What is the average ROI for property investments in Rwanda?",
          a: "Property investments in Rwanda typically yield 8-15% annual returns, with capital appreciation averaging 12% per year in prime locations like Kigali."
        },
        {
          q: "Which areas in Kigali offer the best investment potential?",
          a: "Nyarutarama, Kimihurura, and Kiyovu offer excellent investment potential due to infrastructure development and growing demand."
        },
        {
          q: "Do you provide financing assistance?",
          a: "While we don't provide direct financing, we partner with local banks and can guide you through the mortgage application process."
        }
      ]
    }
  ]

  return (
    <div className="mt-16">
      <section className="bg-gradient-to-br from-[#0A1628] to-[#4A90A4] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-200">
            Find answers to common questions about property investment in Rwanda.
          </p>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1628] mb-6">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="bg-gray-50 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === `${categoryIndex}-${index}` ? null : `${categoryIndex}-${index}`)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-[#0A1628]">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                        openFaq === `${categoryIndex}-${index}` ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {openFaq === `${categoryIndex}-${index}` && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-700">{faq.a}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-[#0A1628] mb-4">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6">Our expert team is ready to help with personalized answers.</p>
            <button
              onClick={() => setCurrentPage('contact')}
              className="bg-[#87CEEB] text-white px-6 py-3 rounded-lg hover:bg-[#4A90A4] transition-colors"
            >
              Contact Our Experts
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

// Footer Component
function Footer({ setCurrentPage }) {
  return (
    <footer className="bg-[#0A1628] text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#87CEEB] to-[#4A90A4] rounded-lg flex items-center justify-center">
                <Image
                  src="/zolalogo.jpg"
                  alt="Zola logo"
                  width={24}
                  height={24}
                  className="rounded"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold">Zola Real Estate</h1>
                <p className="text-xs text-gray-400">Rwanda Investment Experts</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Licensed real estate consultancy specializing in safe property investments in Rwanda.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm">Services</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><button onClick={() => setCurrentPage('services')} className="hover:text-white transition-colors">Investment Advisory</button></li>
              <li><button onClick={() => setCurrentPage('services')} className="hover:text-white transition-colors">Property Sourcing</button></li>
              <li><button onClick={() => setCurrentPage('services')} className="hover:text-white transition-colors">Due Diligence</button></li>
              <li><button onClick={() => setCurrentPage('services')} className="hover:text-white transition-colors">Property Management</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><button onClick={() => setCurrentPage('about')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => setCurrentPage('projects')} className="hover:text-white transition-colors">Properties</button></li>
              <li><button onClick={() => setCurrentPage('news')} className="hover:text-white transition-colors">Market Insights</button></li>
              <li><button onClick={() => setCurrentPage('contact')} className="hover:text-white transition-colors">Contact</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm">Contact</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>ndisanzemarine@gmail.com</p>
              <p>+250 788 XXX XXX</p>
              <p>Kigali, Rwanda</p>
              <p>Mon-Fri: 8AM-6PM CAT</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 text-center">
          <p className="text-gray-400 text-xs">
            © 2025 Zola Real Estate Consultancy Rwanda LTD. All rights reserved. | RDB Licensed & Registered
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main Website Component
export default function ZolaCompleteWebsite() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />
      case 'about':
        return <AboutPage setCurrentPage={setCurrentPage} />
      case 'services':
        return <ServicesPage setCurrentPage={setCurrentPage} />
      case 'projects':
        return <PropertiesPage setCurrentPage={setCurrentPage} />
      case 'news':
        return <NewsPage setCurrentPage={setCurrentPage} />
      case 'careers':
        return <CareersPage setCurrentPage={setCurrentPage} />
      case 'contact':
        return <ContactPage setCurrentPage={setCurrentPage} />
      case 'faqs':
        return <FAQsPage setCurrentPage={setCurrentPage} />
      default:
        return <HomePage setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {renderPage()}

      <Footer setCurrentPage={setCurrentPage} />

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 bg-[#87CEEB] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4A90A4] transition-colors"
          onClick={() => setCurrentPage('contact')}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-40">
        <motion.div
          className="h-full bg-gradient-to-r from-[#87CEEB] to-[#4A90A4]"
          style={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-20 right-6 w-10 h-10 bg-[#0A1628] text-white rounded-full shadow-lg hover:bg-[#4A90A4] transition-all duration-300 flex items-center justify-center z-40"
      >
        <ArrowLeft className="w-5 h-5 rotate-90" />
      </button>
    </div>
  )
}