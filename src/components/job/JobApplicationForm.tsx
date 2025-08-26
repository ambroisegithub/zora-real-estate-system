"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { createJobApplication, selectApplicationsLoading, selectUploadProgress } from '@/lib/features/job/jobApplicationSlice'
import { Job } from '@/lib/features/auth/jobSlice'
import {
  X,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  Link,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface JobApplicationFormProps {
  job: Job
  isOpen: boolean
  onClose: () => void
}

export function JobApplicationForm({ job, isOpen, onClose }: JobApplicationFormProps) {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectApplicationsLoading)
  const uploadProgress = useAppSelector(selectUploadProgress)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cover_letter: '',
    expected_salary: '',
    notice_period: '',
    portfolio_url: '',
    linkedin_url: ''
  })

  const [files, setFiles] = useState({
    cv: null as File | null,
    additional_documents: null as File | null
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (field: 'cv' | 'additional_documents', file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!files.cv) newErrors.cv = 'CV is required'

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
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

    try {
      await dispatch(createJobApplication({
        ...formData,
        job_id: job.job_id,
        cv: files.cv!,
        additional_documents: files.additional_documents || undefined
      })).unwrap()

      toast.success('Application submitted successfully!')
      onClose()
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        cover_letter: '',
        expected_salary: '',
        notice_period: '',
        portfolio_url: '',
        linkedin_url: ''
      })
      setFiles({ cv: null, additional_documents: null })
    } catch (error) {
      // Error handling is done in the slice
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for {job.title}</h2>
            <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                First Name *
              </Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={errors.first_name ? 'border-red-300' : ''}
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.first_name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="last_name" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Last Name *
              </Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={errors.last_name ? 'border-red-300' : ''}
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'border-red-300' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cv" className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                CV/Resume *
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="cv"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileChange('cv', e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="cv" className="cursor-pointer block">
                  {files.cv ? (
                    <div className="text-green-600">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">{files.cv.name}</p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium text-gray-700">Upload CV</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.cv && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.cv}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="additional_documents" className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Additional Documents
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="additional_documents"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileChange('additional_documents', e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="additional_documents" className="cursor-pointer block">
                  {files.additional_documents ? (
                    <div className="text-green-600">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">{files.additional_documents.name}</p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium text-gray-700">Additional Files</p>
                      <p className="text-xs text-gray-500">Optional supporting documents</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uploading files...</span>
                <span className="text-blue-600 font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Additional Information */}
          <div>
            <Label htmlFor="cover_letter" className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              Cover Letter
            </Label>
            <Textarea
              id="cover_letter"
              name="cover_letter"
              value={formData.cover_letter}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expected_salary" className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4" />
                Expected Salary
              </Label>
              <Input
                id="expected_salary"
                name="expected_salary"
                value={formData.expected_salary}
                onChange={handleInputChange}
                placeholder="e.g., $50,000 - $60,000"
              />
            </div>

            <div>
              <Label htmlFor="notice_period" className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Notice Period
              </Label>
              <Input
                id="notice_period"
                name="notice_period"
                value={formData.notice_period}
                onChange={handleInputChange}
                placeholder="e.g., 2 weeks, 1 month"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="portfolio_url" className="flex items-center gap-2 mb-2">
                <Link className="w-4 h-4" />
                Portfolio URL
              </Label>
              <Input
                id="portfolio_url"
                name="portfolio_url"
                type="url"
                value={formData.portfolio_url}
                onChange={handleInputChange}
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div>
              <Label htmlFor="linkedin_url" className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4" />
                LinkedIn URL
              </Label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}