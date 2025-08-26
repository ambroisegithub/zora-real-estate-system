"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import {
  createNews,
  updateNews,
  fetchNewsById,
  selectCurrentNews,
  selectNewsletterLoading,
  selectUploadProgress,
  NewsStatus,
  NewsCategory,
  NewsletterFormData
} from "@/lib/features/auth/newsletterSlice"
import {
  Save,
  X,
  Upload,
  Image as ImageIcon,
  FileText,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Eye,
  Calendar,
  Clock
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

const CreateEditNewsLetter = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  
  const currentNews = useAppSelector(selectCurrentNews)
  const loading = useAppSelector(selectNewsletterLoading)
  const uploadProgress = useAppSelector(selectUploadProgress)

  const [isEditMode, setIsEditMode] = useState(false)
  const [newsId, setNewsId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState<NewsletterFormData>({
    title: '',
    summary: '',
    content: '',
    category: NewsCategory.MARKET_TRENDS,
    featured_image: null,
    read_time: '3 min read',
    send_to_subscribers: true,
    status: NewsStatus.DRAFT
  })

  // Image handling
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageDeleteDialog, setImageDeleteDialog] = useState(false)

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewDialog, setPreviewDialog] = useState(false)

  // Check if we're in edit mode
  useEffect(() => {
    if (params?.id) {
      const id = parseInt(params.id as string)
      setNewsId(id)
      setIsEditMode(true)
      dispatch(fetchNewsById(id))
    }
  }, [params, dispatch])

  // Populate form when news data is loaded
  useEffect(() => {
    if (isEditMode && currentNews) {
      setFormData({
        title: currentNews.title,
        summary: currentNews.summary,
        content: currentNews.content,
        category: currentNews.category,
        featured_image: null,
        read_time: currentNews.read_time || '3 min read',
        send_to_subscribers: currentNews.send_to_subscribers,
        status: currentNews.status
      })
      setPreviewUrl(currentNews.featured_image || null)
    }
  }, [isEditMode, currentNews])

  const handleInputChange = (field: keyof NewsletterFormData, value: any) => {
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
    handleInputChange('featured_image', file)
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    handleInputChange('featured_image', null)
    if (isEditMode && currentNews?.featured_image) {
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
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required'
    } else if (formData.summary.length < 50) {
      newErrors.summary = 'Summary must be at least 50 characters'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.length < 100) {
      newErrors.content = 'Content must be at least 100 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

// In your CreateEditNewsLetter component
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.error('Please fix the errors before submitting');
    return;
  }

  try {
    console.log("=== SUBMITTING FORM DATA ===");
    console.log("Form data:", formData);
    console.log("Selected image:", selectedImage);
    console.log("============================");

    let result;
    if (isEditMode && newsId) {
      result = await dispatch(updateNews({ 
        id: newsId, 
        updates: formData 
      })).unwrap();
    } else {
      result = await dispatch(createNews(formData)).unwrap();
    }
    
    console.log("Submission successful:", result);
    toast.success('News article created successfully!');
    router.push('/dashboard/owner/newsletter');
  } catch (error: any) {
    console.error('=== SUBMISSION FAILED ===');
    console.error('Error:', error);
    console.error('Error payload:', error.payload);
    console.error('=======================');
    
    toast.error(error.payload || 'Failed to save news article');
  }
};

  const getCategoryColor = (category: NewsCategory) => {
    const colors = {
      [NewsCategory.MARKET_TRENDS]: 'bg-blue-100 text-blue-700 border-blue-200',
      [NewsCategory.INVESTMENT_OPPORTUNITIES]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [NewsCategory.LEGAL_UPDATES]: 'bg-amber-100 text-amber-700 border-amber-200',
      [NewsCategory.PROJECT_LAUNCHES]: 'bg-purple-100 text-purple-700 border-purple-200',
      [NewsCategory.INDUSTRY_INSIGHTS]: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    }
    return colors[category]
  }

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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
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
              className="mb-2 h-8 px-2 hover:bg-gray-200/80 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit News Article' : 'Create News Article'}
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {isEditMode 
                ? 'Update market news information and content'
                : 'Create a new market news article for newsletter distribution'
              }
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewDialog(true)}
              disabled={!formData.title || !formData.content}
              className="h-9 px-4 border-gray-200 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-4">
              {/* Basic Information */}
              <Card className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Article Content</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Enter the main content of your market news article
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Article Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter compelling news title..."
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
                    <Label htmlFor="summary" className="text-sm font-medium text-gray-700">
                      Summary <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="summary"
                      placeholder="Write a compelling summary that will appear in email previews..."
                      value={formData.summary}
                      onChange={(e) => handleInputChange('summary', e.target.value)}
                      rows={3}
                      className={`resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.summary ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    {errors.summary && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.summary}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.summary.length}/500 characters • This appears in email previews
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                      Content <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Write the full content of your market news article..."
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={12}
                      className={`resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.content ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    {errors.content && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.content}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.content.length} characters • Minimum 100 characters required
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-4">
              {/* Publication Settings */}
              <Card className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Publication</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Configure article settings and distribution
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: NewsCategory) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="h-9 border-gray-200 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-gray-200'>
                        {Object.values(NewsCategory).map(category => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center gap-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${getCategoryColor(category).split(' ')[0]}`} />
                              {category.replace(/_/g, ' ')}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="read_time" className="text-sm font-medium text-gray-700">
                      Read Time
                    </Label>
                    <Input
                      id="read_time"
                      placeholder="e.g., 3 min read"
                      value={formData.read_time}
                      onChange={(e) => handleInputChange('read_time', e.target.value)}
                      className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>

                  {isEditMode && (
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                        Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: NewsStatus) => handleInputChange('status', value)}
                      >
                        <SelectTrigger className="h-9 border-gray-200 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(NewsStatus).map(status => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-2">
                    <Switch
                      id="send_to_subscribers"
                      checked={formData.send_to_subscribers}
                      onCheckedChange={(checked) => handleInputChange('send_to_subscribers', checked)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="send_to_subscribers" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Send to Subscribers
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Featured Image</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Add a compelling image for your article
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-0 space-y-4">
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
                          alt="Article preview"
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
                          Recommended: 1200x630px • Max 5MB
                        </p>
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Article Preview */}
              <Card className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Quick Stats</CardTitle>
                </CardHeader>
                
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Title Length</span>
                    <span className={`font-medium ${formData.title.length >= 10 ? 'text-green-600' : 'text-amber-600'}`}>
                      {formData.title.length}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Summary Length</span>
                    <span className={`font-medium ${formData.summary.length >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
                      {formData.summary.length}/50
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Content Length</span>
                    <span className={`font-medium ${formData.content.length >= 100 ? 'text-green-600' : 'text-amber-600'}`}>
                      {formData.content.length}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category</span>
                    <Badge variant="outline" className={getCategoryColor(formData.category)}>
                      {formData.category.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                disabled={loading}
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Article' : 'Create Article'}
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

        {/* Preview Dialog */}
        <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <DialogContent className="bg-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Article Preview</DialogTitle>
              <DialogDescription>
                This is how your article will appear to readers
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt={formData.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{formData.title || 'Article Title'}</h2>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <Badge variant="outline" className={getCategoryColor(formData.category)}>
                    {formData.category.replace(/_/g, ' ')}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formData.read_time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50">
                  {formData.summary || 'Article summary will appear here...'}
                </p>
                <div className="mt-6 text-gray-800 leading-7 whitespace-pre-wrap">
                  {formData.content || 'Article content will appear here...'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="text-sm text-gray-500">
                  Published by Zola Real Estate Rwanda
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-gray-100">
                    {formData.status || 'draft'}
                  </Badge>
                  {formData.send_to_subscribers && (
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      Newsletter
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default CreateEditNewsLetter