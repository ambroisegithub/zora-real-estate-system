"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import {
  createProperty,
  updateProperty,
  fetchPropertyById,
  deletePropertyImage,
  PropertyType
} from "@/lib/features/auth/PropertiesSlice"
import {
  Building2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  MapPin,
  DollarSign,
  Home,
  Bed,
  Bath,
  Square,
  Star,
  Tag,
  FileText,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface PropertyFormData {
  title: string
  description: string
  price: number
  type: PropertyType
  location: string
  bedrooms?: number
  bathrooms?: number
  area_sq_m?: number
  address?: string
  city?: string
  district?: string
  amenities: string[]
  is_featured: boolean
}

const CreateEditProperty = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  
  // Check both URL params and search params for property ID
  const [propertyId, setPropertyId] = useState<number | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  
  useEffect(() => {
    // Check if we have an ID from URL params (for /create/:id routes)
    if (params?.id) {
      const id = parseInt(params.id as string)
      setPropertyId(id)
      setIsEditMode(true)
    } else {
      // Check if we have an ID from search params (for /create?id= routes)
      const urlParams = new URLSearchParams(window.location.search)
      const searchId = urlParams.get('id')
      if (searchId) {
        const id = parseInt(searchId)
        setPropertyId(id)
        setIsEditMode(true)
      }
    }
  }, [params])

  const {
    currentProperty,
    loading,
    isCreating,
    isUpdating,
    uploadProgress,
    error
  } = useAppSelector((state) => state.properties)

  // Form state
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: 0,
    type: PropertyType.HOUSE,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    area_sq_m: 0,
    address: '',
    city: '',
    district: '',
    amenities: [],
    is_featured: false
  })

  // Image handling
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [imageDeleteDialog, setImageDeleteDialog] = useState<{
    open: boolean
    imageIndex: number
  }>({ open: false, imageIndex: -1 })

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [newAmenity, setNewAmenity] = useState('')

  // Load property data for edit mode
  useEffect(() => {
    if (isEditMode && propertyId) {
      dispatch(fetchPropertyById(propertyId))
    }
  }, [isEditMode, propertyId, dispatch])

  // Populate form when property data is loaded
  useEffect(() => {
    if (isEditMode && currentProperty) {
      setFormData({
        title: currentProperty.title,
        description: currentProperty.description,
        price: currentProperty.price,
        type: currentProperty.type,
        location: currentProperty.location,
        bedrooms: currentProperty.bedrooms || 0,
        bathrooms: currentProperty.bathrooms || 0,
        area_sq_m: currentProperty.area_sq_m || 0,
        address: currentProperty.address || '',
        city: currentProperty.city || '',
        district: currentProperty.district || '',
        amenities: currentProperty.amenities || [],
        is_featured: currentProperty.is_featured
      })
      setExistingImages(currentProperty.image_urls || [])
    }
  }, [isEditMode, currentProperty])

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newImages = Array.from(files)
    const totalImages = selectedImages.length + existingImages.length + newImages.length

    if (totalImages > 10) {
      toast.error('Maximum 10 images allowed per property')
      return
    }

    // Validate image files
    const validImages: File[] = []
    for (const file of newImages) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image ${file.name} is too large. Maximum size is 5MB.`)
        continue
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not a valid image.`)
        continue
      }
      
      validImages.push(file)
    }

    setSelectedImages(prev => [...prev, ...validImages])
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeleteExistingImage = async (imageIndex: number) => {
    if (!propertyId) return
    
    try {
      await dispatch(deletePropertyImage({ 
        propertyId, 
        imageIndex 
      })).unwrap()
      
      setExistingImages(prev => prev.filter((_, i) => i !== imageIndex))
      setImageDeleteDialog({ open: false, imageIndex: -1 })
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }))
      setNewAmenity('')
    }
  }

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Property title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Property description is required'
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    const submitData = {
      ...formData,
      images: selectedImages
    }

    try {
      if (isEditMode && propertyId) {
        await dispatch(updateProperty({ 
          id: propertyId, 
          propertyData: submitData 
        })).unwrap()
        toast.success('Property updated successfully!')
      } else {
        await dispatch(createProperty(submitData)).unwrap()
        toast.success('Property created successfully!')
      }
      
      router.push('/dashboard/owner/properties')
    } catch (error: any) {
      console.error('Failed to save property:', error)
    }
  }

  const renderStep1 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Basic Information */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-green-100">
            <Building2 className="w-4 h-4 text-green-700" />
          </div>
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Property Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter property title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`h-9 border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.title ? 'border-red-300 focus:border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                Price (USD) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={`h-9 pl-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.price ? 'border-red-300 focus:border-red-500' : ''}`}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.price}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                Property Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange('type', value as PropertyType)}
              >
                <SelectTrigger className="h-9 border-gray-200 focus:border-green-500 focus:ring-green-500/20">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent className='bg-white border-gray-200 shadow-lg'>
                  {Object.values(PropertyType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  id="location"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`h-9 pl-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.location ? 'border-red-300 focus:border-red-500' : ''}`}
                />
              </div>
              {errors.location && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the property in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`resize-none border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.description ? 'border-red-300 focus:border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-green-100">
            <Home className="w-4 h-4 text-green-700" />
          </div>
          <h3 className="font-semibold text-gray-900">Property Details</h3>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bedrooms" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Bed className="w-3 h-3" />
                Beds
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                placeholder="0"
                value={formData.bedrooms || ''}
                onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                className="h-9 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bathrooms" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Bath className="w-3 h-3" />
                Baths
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                placeholder="0"
                value={formData.bathrooms || ''}
                onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                className="h-9 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="area_sq_m" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Square className="w-3 h-3" />
                Area (m²)
              </Label>
              <Input
                id="area_sq_m"
                type="number"
                min="0"
                placeholder="0"
                value={formData.area_sq_m || ''}
                onChange={(e) => handleInputChange('area_sq_m', parseInt(e.target.value) || 0)}
                className="h-9 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
              <Input
                id="address"
                placeholder="Street address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="h-9 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="h-9 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="district" className="text-sm font-medium text-gray-700">District</Label>
              <Input
                id="district"
                placeholder="District"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                className="h-9 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
              className="data-[state=checked]:bg-green-600 bg-blue-200"
            />
            <Label htmlFor="is_featured" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <Star className="w-4 h-4 text-yellow-500" />
              Featured Property
            </Label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-green-100">
          <Tag className="w-4 h-4 text-green-700" />
        </div>
        <h3 className="font-semibold text-gray-900">Amenities & Features</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add amenity (e.g., Swimming Pool, Parking, Garden)"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
            className="h-9 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
          />
          <Button 
            type="button" 
            onClick={addAmenity} 
            size="sm"
            className="h-9 px-3 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
              >
                {amenity}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeAmenity(amenity)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-green-100">
          <ImageIcon className="w-4 h-4 text-green-700" />
        </div>
        <h3 className="font-semibold text-gray-900">Property Images</h3>
        <span className="text-xs text-gray-500 ml-auto">Max 10 images, 5MB each</span>
      </div>

      <div className="space-y-4">
        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Uploading images...</span>
              <span className="text-green-600 font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Image Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 hover:bg-green-50/50 transition-all duration-200">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            <div className="p-2 rounded-full bg-gray-100 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Click to upload images
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop or click to browse
            </p>
          </label>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto">
          {/* Existing Images */}
          {isEditMode && existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="relative group aspect-square">
              <img
                src={image.url}
                alt={`Property image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setImageDeleteDialog({ open: true, imageIndex: index })}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* New Selected Images */}
          {selectedImages.map((image, index) => (
            <div key={`new-${index}`} className="relative group aspect-square">
              <img
                src={URL.createObjectURL(image)}
                alt={`Selected image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => removeSelectedImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 text-center">
          Total images: <span className="font-medium text-green-600">{existingImages.length + selectedImages.length}</span> / 10
        </div>
      </div>
    </div>
  )

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          
          <div className="bg-white rounded-xl p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-24 w-full mt-4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-2 h-8 px-2  -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {isEditMode 
                ? 'Update property information and manage details'
                : 'Fill in the property details to add it to your portfolio'
              }
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      step === currentStep
                        ? 'bg-green-600 text-white'
                        : step < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-colors ${
                        step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">Step {currentStep} of 3</span>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Basic Info</span>
            <span>Amenities</span>
            <span>Images</span>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-4">
            <div className="flex justify-between">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="h-9 px-4 border-gray-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="h-9 px-4 bg-green-600 hover:bg-green-700 shadow-sm"
                  >
                    Next
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="h-9 px-4 bg-green-600 hover:bg-green-700 shadow-sm disabled:opacity-50"
                  >
                    {(isCreating || isUpdating) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEditMode ? 'Update Property' : 'Create Property'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Delete Image Dialog */}
        <Dialog 
          open={imageDeleteDialog.open} 
          onOpenChange={(open) => setImageDeleteDialog({ open, imageIndex: -1 })}
        >
          <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Delete Image
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete this image? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setImageDeleteDialog({ open: false, imageIndex: -1 })}
                className="h-9 px-4 border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteExistingImage(imageDeleteDialog.imageIndex)}
                className="h-9 px-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default CreateEditProperty