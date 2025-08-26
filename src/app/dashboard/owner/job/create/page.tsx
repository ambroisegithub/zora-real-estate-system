"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import {
  createJob,
  updateJob,
  fetchJobById,
  selectCurrentJob,
  selectJobsLoading,
  selectJobsError,
  JobType,
  JobStatus
} from "@/lib/features/auth/jobSlice"
import {
  Save,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Calendar,
  MapPin,
  DollarSign,
  Building,
  Clock,
  BarChart3,
  Loader2,
  FileText,
  Settings
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
import { format } from "date-fns"

interface JobFormData {
  title: string
  description: string
  requirements: string
  responsibilities: string
  type: JobType
  status: JobStatus
  location: string
  salary_range: string
  department: string
  application_deadline: string
  experience_level: number
  is_active: boolean
}

const JobCreationEdit = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  
  const currentJob = useAppSelector(selectCurrentJob)
  const loading = useAppSelector(selectJobsLoading)
  const error = useAppSelector(selectJobsError)

  const [isEditMode, setIsEditMode] = useState(false)
  const [jobId, setJobId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    type: JobType.FULL_TIME,
    status: JobStatus.ACTIVE,
    location: '',
    salary_range: '',
    department: '',
    application_deadline: '',
    experience_level: 0,
    is_active: true
  })

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if we're in edit mode
  useEffect(() => {
    if (params?.id) {
      const id = parseInt(params.id as string)
      setJobId(id)
      setIsEditMode(true)
      dispatch(fetchJobById(id))
    }
  }, [params, dispatch])

  // Populate form when job data is loaded
  useEffect(() => {
    if (isEditMode && currentJob) {
      setFormData({
        title: currentJob.title,
        description: currentJob.description,
        requirements: currentJob.requirements,
        responsibilities: currentJob.responsibilities,
        type: currentJob.type,
        status: currentJob.status,
        location: currentJob.location,
        salary_range: currentJob.salary_range || '',
        department: currentJob.department || '',
        application_deadline: currentJob.application_deadline 
          ? format(new Date(currentJob.application_deadline), 'yyyy-MM-dd')
          : '',
        experience_level: currentJob.experience_level,
        is_active: currentJob.is_active
      })
    }
  }, [isEditMode, currentJob])

  const handleInputChange = (field: keyof JobFormData, value: any) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required'
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Job requirements are required'
    }

    if (!formData.responsibilities.trim()) {
      newErrors.responsibilities = 'Job responsibilities are required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Job location is required'
    }

    if (formData.application_deadline) {
      const deadline = new Date(formData.application_deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (deadline < today) {
        newErrors.application_deadline = 'Application deadline cannot be in the past'
      }
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

    setIsSubmitting(true)

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        type: formData.type,
        status: formData.status,
        location: formData.location,
        salary_range: formData.salary_range,
        department: formData.department,
        application_deadline: formData.application_deadline || undefined,
        experience_level: formData.experience_level,
        is_active: formData.is_active
      }

      if (isEditMode && jobId) {
        await dispatch(updateJob({ 
          id: jobId, 
          jobData: submitData 
        })).unwrap()
        toast.success('Job updated successfully!')
      } else {
        await dispatch(createJob(submitData)).unwrap()
        toast.success('Job created successfully!')
      }
      
      router.push('/dashboard/owner/jobs')
    } catch (error: any) {
      console.error('Failed to save job:', error)
      toast.error(error.message || 'Failed to save job')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getJobTypeBadge = (type: JobType) => {
    const typeConfig = {
      [JobType.FULL_TIME]: { label: 'Full Time', color: 'bg-blue-100 text-blue-800' },
      [JobType.PART_TIME]: { label: 'Part Time', color: 'bg-green-100 text-green-800' },
      [JobType.CONTRACT]: { label: 'Contract', color: 'bg-purple-100 text-purple-800' },
      [JobType.INTERNSHIP]: { label: 'Internship', color: 'bg-orange-100 text-orange-800' }
    }
    
    const config = typeConfig[type]
    return <Badge variant="secondary" className={config.color}>{config.label}</Badge>
  }

  const getStatusBadge = (status: JobStatus) => {
    const statusConfig = {
      [JobStatus.ACTIVE]: { label: 'Active', color: 'bg-green-100 text-green-800' },
      [JobStatus.CLOSED]: { label: 'Closed', color: 'bg-red-100 text-red-800' },
      [JobStatus.DRAFT]: { label: 'Draft', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status]
    return <Badge variant="secondary" className={config.color}>{config.label}</Badge>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
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
              {isEditMode ? 'Edit Job' : 'Create New Job'}
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {isEditMode 
                ? 'Update job information and details'
                : 'Create a new job posting to attract candidates'
              }
            </p>
          </div>
          
          {isEditMode && currentJob && (
            <div className="flex gap-2">
              {getJobTypeBadge(currentJob.type)}
              {getStatusBadge(currentJob.status)}
            </div>
          )}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Job Details */}
            <Card className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Job Details
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Enter the core information about the job position
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer"
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
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the job role, company culture, and what makes this position unique..."
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
                  <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">
                    Requirements <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="List the required skills, qualifications, and experience..."
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    rows={4}
                    className={`resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.requirements ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {errors.requirements && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.requirements}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities" className="text-sm font-medium text-gray-700">
                    Responsibilities <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Describe the day-to-day responsibilities and key tasks..."
                    value={formData.responsibilities}
                    onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                    rows={4}
                    className={`resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.responsibilities ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {errors.responsibilities && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.responsibilities}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Settings & Information */}
            <Card className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200/50 p-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Job Settings & Information
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Configure job type, location, and other details
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                      Job Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: JobType) => handleInputChange('type', value)}
                    >
                      <SelectTrigger className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'>
                        <SelectItem value={JobType.FULL_TIME}>Full Time</SelectItem>
                        <SelectItem value={JobType.PART_TIME}>Part Time</SelectItem>
                        <SelectItem value={JobType.CONTRACT}>Contract</SelectItem>
                        <SelectItem value={JobType.INTERNSHIP}>Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: JobStatus) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue />
                      </SelectTrigger>
                     <SelectContent className='bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'>

                        <SelectItem value={JobStatus.ACTIVE}>Active</SelectItem>
                        <SelectItem value={JobStatus.CLOSED}>Closed</SelectItem>
                        <SelectItem value={JobStatus.DRAFT}>Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY or Remote"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.location ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {errors.location && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.location}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_range" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Salary Range
                  </Label>
                  <Input
                    id="salary_range"
                    placeholder="e.g., $80,000 - $120,000 per year"
                    value={formData.salary_range}
                    onChange={(e) => handleInputChange('salary_range', e.target.value)}
                    className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    placeholder="e.g., Engineering, Marketing, Sales"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application_deadline" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Application Deadline
                  </Label>
                  <Input
                    id="application_deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    className={`h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.application_deadline ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {errors.application_deadline && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.application_deadline}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_level" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    Experience Level (years)
                  </Label>
                  <Input
                    id="experience_level"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.experience_level}
                    onChange={(e) => handleInputChange('experience_level', parseInt(e.target.value) || 0)}
                    className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <Label htmlFor="is_active" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Active Job Posting
                  </Label>
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Update Job' : 'Create Job'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobCreationEdit