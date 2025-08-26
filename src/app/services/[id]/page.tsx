"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Share2, CheckCircle, Loader2, Mail, Phone, MessageCircle,
  TrendingUp, Award, Users, Clock, DollarSign, Target, Lightbulb,
  Copy, Twitter, Linkedin, X, ChevronLeft, ChevronRight,
  Building, Shield, Eye
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

// Import Redux slices
import { 
  fetchServiceById, 
  selectCurrentService, 
  selectServicesLoading,
  selectServicesError,
  clearCurrentService
} from '@/lib/features/auth/ServiceSlice'

// Skeleton Loader
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

// Image Preview Modal
function ImagePreviewModal({ imageUrl, onClose }) {
  if (!imageUrl) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt="Service preview"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
}

export default function ServiceDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  
  const service = useAppSelector(selectCurrentService)
  const isLoading = useAppSelector(selectServicesLoading)
  const error = useAppSelector(selectServicesError)
  
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)

  // Contact information - Replace with your actual contact details
  const contactInfo = {
    email: 'ndisanzemarine@gmail.com',
    phone: '+250783690402',
    whatsapp: '+250783690402'
  }

  useEffect(() => {
    if (params.id) {
      dispatch(fetchServiceById(Number(params.id)))
    }
    
    return () => {
      dispatch(clearCurrentService())
    }
  }, [dispatch, params.id])

  const handleShare = () => {
    const shareData = {
      title: service?.title || '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      text: `Check out this service: ${service?.title}`
    }

    if (navigator.share) {
      navigator.share(shareData).catch(() => setShowShareMenu(true))
    } else {
      setShowShareMenu(true)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
      setShowShareMenu(false)
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`Check out this service: ${service?.title} - ${window.location.href}`)}`
    window.open(url, '_blank')
    setShowShareMenu(false)
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(service?.title || '')}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank')
    setShowShareMenu(false)
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(service?.title || '')}`
    window.open(url, '_blank')
    setShowShareMenu(false)
  }

  // Dynamic contact handlers
  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Inquiry about ${service?.title || 'Service'}`)
    const body = encodeURIComponent(`Hi,\n\nI'm interested in learning more about your ${service?.title} service.\n\nBest regards`)
    window.location.href = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`
  }

  const handleCallUs = () => {
    window.location.href = `tel:${contactInfo.phone}`
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hi, I'm interested in your ${service?.title} service. Can you provide more information?`)
    window.open(`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
  }

  const serviceBenefits = [
    { icon: Shield, title: "Professional Expertise", desc: "Expert guidance from licensed professionals" },
    { icon: Target, title: "Tailored Solutions", desc: "Customized approach for your specific needs" },
    { icon: Clock, title: "Time Efficient", desc: "Streamlined processes save you valuable time" },
    { icon: DollarSign, title: "Cost Effective", desc: "Competitive pricing with transparent fees" },
    { icon: Award, title: "Quality Assured", desc: "Guaranteed satisfaction with every service" },
    { icon: Users, title: "Client Support", desc: "Dedicated support throughout your journey" }
  ]

  const serviceProcess = [
    { step: 1, title: "Initial Consultation", desc: "Free consultation to understand your requirements" },
    { step: 2, title: "Custom Proposal", desc: "Detailed proposal tailored to your needs" },
    { step: 3, title: "Service Delivery", desc: "Professional execution of the agreed services" },
    { step: 4, title: "Follow-up Support", desc: "Ongoing support and assistance after completion" }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-12">
              <SkeletonLoader className="h-6 w-24" />
              <SkeletonLoader className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
            <div className="lg:col-span-1 space-y-4">
              <SkeletonLoader className="h-48 rounded-lg" />
            </div>
            <div className="lg:col-span-4">
              <SkeletonLoader className="h-64 rounded-lg mb-4" />
              <SkeletonLoader className="h-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-600 text-sm mb-6">{error || "The service you're looking for doesn't exist."}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white rounded-lg font-medium hover:bg-[#4A90A4] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-xs font-semibold text-[#87CEEB] hover:text-[#4A90A4] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Services</span>
            </button>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-16 self-start">
            
            {/* Service Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#87CEEB]" />
                Service Status
              </h3>
              
              <div className="space-y-2">
                {service.is_active ? (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                    <X className="w-3 h-3 mr-1" />
                    Inactive
                  </span>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Last Updated: {new Date(service.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-gradient-to-br from-[#87CEEB]/10 to-[#4A90A4]/10 rounded-lg shadow-sm border border-[#87CEEB]/30 p-4">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-3">Inquire About This Service</h3>
              
              <div className="space-y-2">
                <button 
                  onClick={handleSendEmail}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-[#87CEEB] text-white rounded-lg hover:bg-[#4A90A4] transition-colors text-sm font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
                
        
                
                <button 
                  onClick={handleWhatsApp}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Related Services Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Other Services</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-xs text-gray-700">
                  Property Investment Advisory
                </button>
                <button className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-xs text-gray-700">
                  Property Management
                </button>
                <button className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-xs text-gray-700">
                  Legal Consultation
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4">
            
            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
              
              {/* Cover Image */}
              <div 
                className="relative h-48 md:h-56 bg-gradient-to-br from-[#87CEEB] to-[#4A90A4] overflow-hidden cursor-pointer group"
                onClick={() => service.image_url && setShowImagePreview(true)}
              >
                {service.image_url ? (
                  <>
                    <Image
                      src={service.image_url}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <TrendingUp className="w-16 h-16 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Service Icon Badge */}
                <div className="absolute top-4 right-4">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    {service.icon_name ? (
                      <span className="text-2xl">{service.icon_name}</span>
                    ) : (
                      <TrendingUp className="w-6 h-6 text-[#87CEEB]" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628] mb-3 tracking-tight leading-tight">
                  {service.title}
                </h1>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleWhatsApp}
                    className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-[#87CEEB] to-[#4A90A4] text-white rounded-lg hover:from-[#4A90A4] hover:to-[#0A1628] transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Get Started
                  </button>

                  {/* Share Button with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center gap-2 text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>

                    {showShareMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setShowShareMenu(false)}
                        />
                        
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                          <div className="p-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900">Share this service</h3>
                          </div>
                          <div className="p-2">
                            <button
                              onClick={copyToClipboard}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left text-sm"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                              <span>Copy Link</span>
                            </button>

                            <button
                              onClick={shareToWhatsApp}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-green-50 rounded-lg transition-colors text-left text-sm"
                            >
                              <MessageCircle className="w-4 h-4 text-green-600" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={shareToTwitter}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-left text-sm"
                            >
                              <Twitter className="w-4 h-4 text-blue-600" />
                              <span>Twitter</span>
                            </button>

                            <button
                              onClick={shareToLinkedIn}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-left text-sm"
                            >
                              <Linkedin className="w-4 h-4 text-blue-700" />
                              <span>LinkedIn</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
              <h2 className="text-lg font-bold text-[#0A1628] mb-3">Service Overview</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{service.description}</p>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
              <h2 className="text-lg font-bold text-[#0A1628] mb-4">Service Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <div className="p-2 bg-[#87CEEB] rounded-lg flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0A1628] text-sm">{benefit.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg font-bold text-[#0A1628] mb-4">How It Works</h2>
              <div className="space-y-3">
                {serviceProcess.map((step, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#87CEEB] to-[#4A90A4] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0A1628] text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && service.image_url && (
          <ImagePreviewModal
            imageUrl={service.image_url}
            onClose={() => setShowImagePreview(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}