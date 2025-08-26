"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import {
  createService,
  updateService,
  fetchServiceById,
  selectCurrentService,
  selectServicesLoading,
  selectServicesError,
  setUploadProgress,
  resetUploadProgress
} from "@/lib/features/auth/ServiceSlice"
import {
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Settings,
  FileText,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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

interface ServiceFormData {
  title: string
  description: string
  icon_name: string
  is_active: boolean
  display_order: number
}

const CreateEditService = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  
  const currentService = useAppSelector(selectCurrentService)
  const loading = useAppSelector(selectServicesLoading)
  const error = useAppSelector(selectServicesError)
  const uploadProgress = useAppSelector(state => state.services.uploadProgress)

  const [isEditMode, setIsEditMode] = useState(false)
  const [serviceId, setServiceId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    icon_name: '',
    is_active: true,
    display_order: 0
  })

  // Image handling
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageDeleteDialog, setImageDeleteDialog] = useState(false)

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check if we're in edit mode
  useEffect(() => {
    if (params?.id) {
      const id = parseInt(params.id as string)
      setServiceId(id)
      setIsEditMode(true)
      dispatch(fetchServiceById(id))
    }
  }, [params, dispatch])

  // Populate form when service data is loaded
  useEffect(() => {
    if (isEditMode && currentService) {
      setFormData({
        title: currentService.title,
        description: currentService.description,
        icon_name: currentService.icon_name || '',
        is_active: currentService.is_active,
        display_order: currentService.display_order
      })
      setPreviewUrl(currentService.image_url)
    }
  }, [isEditMode, currentService])

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
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
    const file = event.target.files?.[0]
    if (!file) return

    // Validate image file
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Maximum size is 5MB.')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('File is not a valid image.')
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    if (isEditMode && currentService?.image_url) {
      setImageDeleteDialog(true)
    }
  }

  const handleDeleteImage = () => {
    setPreviewUrl(null)
    setImageDeleteDialog(false)
    // The actual image deletion will be handled by the backend during update
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Service title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Service description is required'
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

    const submitData = new FormData()
    submitData.append('title', formData.title)
    submitData.append('description', formData.description)
    submitData.append('icon_name', formData.icon_name)
    submitData.append('is_active', formData.is_active.toString())
    submitData.append('display_order', formData.display_order.toString())

    if (selectedImage) {
      submitData.append('document', selectedImage)
    }

    try {
      if (isEditMode && serviceId) {
        await dispatch(updateService({ 
          id: serviceId, 
          serviceData: submitData 
        })).unwrap()
        toast.success('Service updated successfully!')
      } else {
        await dispatch(createService(submitData)).unwrap()
        toast.success('Service created successfully!')
      }
      
      router.push('/dashboard/admin/services')
    } catch (error: any) {
      console.error('Failed to save service:', error)
    }
  }

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
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
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-2 h-8 px-2 hover:bg-gray-200/80 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Service' : 'Add New Service'}
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {isEditMode 
                ? 'Update service information and details'
                : 'Create a new service to showcase your offerings'
              }
            </p>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Basic Information */}
            <Card className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Enter the basic details of your service
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Service Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter service title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.title ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the service in detail..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.description ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon_name" className="text-sm font-medium text-gray-700">
                    Icon Name
                  </Label>
                  <Input
                    id="icon_name"
                    placeholder="e.g., settings, user, home"
                    value={formData.icon_name}
                    onChange={(e) => handleInputChange('icon_name', e.target.value)}
                    className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <p className="text-xs text-gray-500">
                    Enter the name of the icon to represent this service (optional)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Service Settings */}
            <Card className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Service Settings</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Configure service visibility and ordering
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_order" className="text-sm font-medium text-gray-700">
                    Display Order
                  </Label>
                  <Input
                    id="display_order"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.display_order}
                    onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                    className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <p className="text-xs text-gray-500">
                    Lower numbers appear first. Use 0 for default ordering.
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="is_active" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Active Service
                  </Label>
                </div>

                {/* Image Upload */}
                <div className="space-y-2 pt-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Service Image
                  </Label>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Uploading image...</span>
                        <span className="text-blue-600 font-medium">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Service preview"
                          className="w-full h-32 object-contain rounded-lg mx-auto mb-3"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-7 w-7 p-0"
                          onClick={removeSelectedImage}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="image-upload" className="cursor-pointer block">
                        <div className="p-2 rounded-full bg-gray-100 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-500">
                          Maximum file size: 5MB
                        </p>
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-4">
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-9 px-4 border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </div>
        </form>

        {/* Delete Image Dialog */}
        <Dialog 
          open={imageDeleteDialog} 
          onOpenChange={setImageDeleteDialog}
        >
          <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Remove Image
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to remove this image? The image will be permanently deleted from the server.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setImageDeleteDialog(false)}
                className="h-9 px-4 border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteImage}
                className="h-9 px-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default CreateEditService