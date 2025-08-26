"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Share2, Heart, Loader2, Mail, Phone, MessageCircle, MapPin,
  Home, Bed, Bath, Square, DollarSign, Calendar, Eye, X, ChevronLeft, ChevronRight,
  Copy, Twitter, Linkedin, CheckCircle, Building, Shield, Image as ImageIcon
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

// Import Redux slices
import { 
  fetchPropertyById, 
  selectCurrentProperty, 
  selectPropertiesLoading,
  selectPropertiesError,
  clearCurrentProperty
} from '@/lib/features/auth/PropertiesSlice'

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
function ImagePreviewModal({ images, currentIndex, onClose, onPrev, onNext }) {
  if (!images || images.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={onPrev}
        className="absolute left-4 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      <div className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
        <div className="relative w-full h-full">
          <Image
            src={images[currentIndex].url}
            alt={`Property image ${currentIndex + 1}`}
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}

export default function PropertyDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  
  const property = useAppSelector(selectCurrentProperty)
  const isLoading = useAppSelector(selectPropertiesLoading)
  const error = useAppSelector(selectPropertiesError)
  
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  // Contact information - Replace with your actual contact details
  const contactInfo = {
   email: 'ndisanzemarine@gmail.com',
    phone: '+250783690402',
    whatsapp: '+250783690402'
  }

  useEffect(() => {
    if (params.id) {
      dispatch(fetchPropertyById(Number(params.id)))
    }
    
    return () => {
      dispatch(clearCurrentProperty())
    }
  }, [dispatch, params.id])

  const handleShare = () => {
    const shareData = {
      title: property?.title || '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      text: `Check out this property: ${property?.title}`
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
    const url = `https://wa.me/?text=${encodeURIComponent(`Check out this property: ${property?.title} - ${window.location.href}`)}`
    window.open(url, '_blank')
    setShowShareMenu(false)
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(property?.title || '')}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank')
    setShowShareMenu(false)
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(property?.title || '')}`
    window.open(url, '_blank')
    setShowShareMenu(false)
  }

  const openImagePreview = (index: number) => {
    setCurrentImageIndex(index)
    setShowImagePreview(true)
  }

  const handlePrevImage = () => {
    if (!property?.image_urls) return
    setCurrentImageIndex((prev) => (prev === 0 ? property.image_urls.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    if (!property?.image_urls) return
    setCurrentImageIndex((prev) => (prev === property.image_urls.length - 1 ? 0 : prev + 1))
  }

  // Dynamic contact handlers
  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Inquiry about ${property?.title || 'Property'}`)
    const body = encodeURIComponent(`Hi,\n\nI'm interested in this property:\n${property?.title}\nPrice: $${property?.price.toLocaleString()}\nLocation: ${property?.location}\n\nCan you provide more information?\n\nBest regards`)
    window.location.href = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`
  }

  const handleCallAgent = () => {
    window.location.href = `tel:${contactInfo.phone}`
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hi, I'm interested in this property:\n${property?.title}\nPrice: $${property?.price.toLocaleString()}\nLocation: ${property?.location}\n\nCan you provide more information?`)
    window.open(`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
  }

  const handleScheduleViewing = () => {
    const subject = encodeURIComponent(`Schedule Viewing - ${property?.title || 'Property'}`)
    const body = encodeURIComponent(`Hi,\n\nI would like to schedule a viewing for:\n${property?.title}\nPrice: $${property?.price.toLocaleString()}\nLocation: ${property?.location}\n\nPlease let me know your available times.\n\nBest regards`)
    window.location.href = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      available: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      sold: { bg: 'bg-red-100', text: 'text-red-700', icon: X },
      rented: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Calendar }
    }
    const config = badges[status as keyof typeof badges] || badges.available
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </span>
    )
  }

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
              <SkeletonLoader className="h-96 rounded-lg mb-4" />
              <SkeletonLoader className="h-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 text-sm mb-6">{error || "The property you're looking for doesn't exist."}</p>
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

  // Check if property has only one image
  const hasOnlyOneImage = !property.image_urls || property.image_urls.length === 1

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
              <span>Back to Properties</span>
            </button>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsFavorited(!isFavorited)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
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
            
            {/* Price Card */}
            <div className="bg-gradient-to-br from-[#87CEEB]/10 to-[#4A90A4]/10 rounded-lg shadow-sm border border-[#87CEEB]/30 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#87CEEB]" />
                Price
              </h3>
              <p className="text-2xl font-bold text-[#0A1628]">
                ${property.price.toLocaleString()}
              </p>
            </div>

            {/* Property Agent Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Agent</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#4A90A4] flex items-center justify-center text-white font-semibold text-sm">
                  {property.created_by?.name?.charAt(0) || 'Z'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">
                    {property.created_by?.name || 'Zola Real Estate'}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">Licensed Agent</p>
                </div>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Agent</h3>
              
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

            {/* Property Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Details</h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="text-gray-700 font-medium">{property.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status:</span>
                  {getStatusBadge(property.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Listed:</span>
                  <span className="text-gray-700 font-medium">
                    {new Date(property.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4">
            
            {/* Header Card with Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
              
              {/* Image Gallery */}
              <div className="relative">
                {property.image_urls && property.image_urls.length > 0 ? (
                  <div className="grid grid-cols-4 gap-1">
                    <div 
                      className={`${hasOnlyOneImage ? 'col-span-4' : 'col-span-4 md:col-span-3'} h-64 md:h-96 relative cursor-pointer group`}
                      onClick={() => openImagePreview(0)}
                    >
                      <Image
                        src={property.image_urls[0].url}
                        alt={property.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {/* One Image Badge */}
                      {hasOnlyOneImage && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-[#87CEEB] text-white rounded-full text-xs font-semibold flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          1 Image
                        </div>
                      )}
                    </div>
                    
                    {!hasOnlyOneImage && property.image_urls.slice(1, 4).map((image, idx) => (
                      <div 
                        key={idx}
                        className="h-32 md:h-48 relative cursor-pointer group"
                        onClick={() => openImagePreview(idx + 1)}
                      >
                        <Image
                          src={image.url}
                          alt={`${property.title} - ${idx + 2}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 md:h-96 bg-gradient-to-br from-[#87CEEB] to-[#4A90A4] flex items-center justify-center">
                    <Home className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {getStatusBadge(property.status)}
                  {property.is_featured && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  )}
                </div>

                {/* Image Counter */}
                {property.image_urls && property.image_urls.length > 1 && (
                  <button
                    onClick={() => openImagePreview(0)}
                    className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-sm text-white rounded-full text-xs font-semibold hover:bg-black/80 transition-colors flex items-center gap-1"
                  >
                    <ImageIcon className="w-3 h-3" />
                    View all {property.image_urls.length} photos
                  </button>
                )}
              </div>
              
              <div className="p-4 md:p-6">
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628] mb-2 tracking-tight leading-tight">
                  {property.title}
                </h1>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 text-[#87CEEB]" />
                  <span className="text-sm">{property.location}</span>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {property.bedrooms && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bed className="w-4 h-4 text-[#87CEEB]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Bedrooms</p>
                        <p className="text-sm font-semibold text-gray-900">{property.bedrooms}</p>
                      </div>
                    </div>
                  )}

                  {property.bathrooms && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Bath className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Bathrooms</p>
                        <p className="text-sm font-semibold text-gray-900">{property.bathrooms}</p>
                      </div>
                    </div>
                  )}

                  {property.area_sq_m && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Square className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Area</p>
                        <p className="text-sm font-semibold text-gray-900">{property.area_sq_m} m²</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Building className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Type</p>
                      <p className="text-sm font-semibold text-gray-900">{property.type}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleScheduleViewing}
                    className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-[#87CEEB] to-[#4A90A4] text-white rounded-lg hover:from-[#4A90A4] hover:to-[#0A1628] transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Viewing
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
                            <h3 className="text-sm font-semibold text-gray-900">Share this property</h3>
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
              <h2 className="text-lg font-bold text-[#0A1628] mb-3">Property Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Features & Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
                <h2 className="text-lg font-bold text-[#0A1628] mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-[#87CEEB] flex-shrink-0" />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#87CEEB]" />
                Location Details
              </h2>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="text-sm font-semibold text-gray-900">{property.address || property.location}</p>
                </div>
                {property.city && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">City</p>
                    <p className="text-sm font-semibold text-gray-900">{property.city}</p>
                  </div>
                )}
                {property.district && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">District</p>
                    <p className="text-sm font-semibold text-gray-900">{property.district}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && property.image_urls && property.image_urls.length > 0 && (
          <ImagePreviewModal
            images={property.image_urls}
            currentIndex={currentImageIndex}
            onClose={() => setShowImagePreview(false)}
            onPrev={handlePrevImage}
            onNext={handleNextImage}
          />
        )}
      </AnimatePresence>
    </div>
  )
}