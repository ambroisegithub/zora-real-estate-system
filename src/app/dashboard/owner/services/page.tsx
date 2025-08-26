"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { useRouter, useParams } from "next/navigation"
import {
  fetchServices,
  deleteService,
  selectServices,
  selectServicesLoading,
  Service
} from '@/lib/features/auth/ServiceSlice'
import {
  Trash2,
  Edit,
  Plus,
  Search,
  Image,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  ArrowUpDown,
  Calendar,
  Sparkles,
  TrendingUp,
  Eye,
  Settings,
  FileText,
  Building2,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const ServiceManagement = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const services = useAppSelector(selectServices)
  const loading = useAppSelector(selectServicesLoading)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; service: Service | null }>({
    open: false,
    service: null
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<'title' | 'created_at' | 'display_order'>('display_order')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const itemsPerPage = 8

  useEffect(() => {
    dispatch(fetchServices({ active_only: false }))
  }, [dispatch])

  // Statistics
  const statistics = useMemo(() => {
    const total = services.length
    const active = services.filter(s => s.is_active).length
    const inactive = services.filter(s => !s.is_active).length
    const withImages = services.filter(s => s.image_url).length

    return { total, active, inactive, withImages }
  }, [services])

  // Filtered and sorted services
  const filteredServices = useMemo(() => {
    let filtered = services.filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' ? true :
                           statusFilter === 'active' ? service.is_active :
                           !service.is_active

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === 'created_at') {
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [services, searchTerm, statusFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredServices.slice(start, start + itemsPerPage)
  }, [filteredServices, currentPage])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.service) return

    try {
      await dispatch(deleteService(deleteDialog.service.service_id)).unwrap()
      setDeleteDialog({ open: false, service: null })
      toast.success('Service deleted successfully')
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete service')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Service Management</h1>
                <p className="text-slate-600 text-sm">Manage and organize your services</p>
              </div>
            </div>
            
            <Button
              onClick={() => router.push('/dashboard/owner/services/create')}
              className="h-9 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Service
            </Button>
          </div>
        </motion.div>

        {/* Compact Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Services</p>
                  <p className="text-2xl font-bold mt-1">{statistics.total}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-100">Active</p>
                  <p className="text-2xl font-bold mt-1">{statistics.active}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-100">Inactive</p>
                  <p className="text-2xl font-bold mt-1">{statistics.inactive}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">With Images</p>
                  <p className="text-2xl font-bold mt-1">{statistics.withImages}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Image className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-3 shadow-sm border border-slate-200"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
                className="h-9 px-3 text-sm rounded-lg border border-gray-200"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
                className="h-9 px-3 text-sm rounded-lg border border-gray-200"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('inactive')}
                size="sm"
                className="h-9 px-3 text-sm rounded-lg border border-gray-200"
              >
                Inactive
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Compact Services Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-sm border border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Services Directory
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {filteredServices.length} services found
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
<div className="bg-white rounded-lg shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gradient-to-r from-blue-50 to-purple-100">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-10">#</th>
          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
            <button
              onClick={() => handleSort('title')}
              className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              Service Details
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </th>
          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
            Status
          </th>
          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
            <button
              onClick={() => handleSort('display_order')}
              className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              Order
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </th>
          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
            <button
              onClick={() => handleSort('created_at')}
              className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              Created
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </th>
          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {paginatedServices.length > 0 ? (
          paginatedServices.map((service, index) => (
            <motion.tr
              key={service.service_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.04 }}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-3 py-3 text-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                      <Image className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {service.title}
                    </div>
            
                    {service.icon_name && (
                      <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5">
                        {service.icon_name}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 hidden lg:table-cell">
                {service.is_active ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">
                    <XCircle className="w-3 h-3 mr-1" /> Inactive
                  </span>
                )}
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded">
                  {service.display_order}
                </span>
              </td>
              <td className="px-3 py-3 hidden xl:table-cell">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                  {formatDate(service.created_at)}
                </div>
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/owner/services/${service.service_id}`)}
                    className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Service"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ open: true, service })}
                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="px-6 py-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-gray-100 p-4 rounded-full mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  No Services Found
                </h3>
                <p className="text-gray-500 text-sm">
                  Try adjusting your search or filters
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>


              {/* Compact Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50">
                  <p className="text-sm font-medium text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                    <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredServices.length)}</span> of{' '}
                    <span className="font-semibold text-slate-900">{filteredServices.length}</span> services
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3 text-sm rounded-lg border-slate-300"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum = i + 1
                        if (totalPages > 5) {
                          if (currentPage > 3) {
                            pageNum = currentPage - 3 + i
                          }
                          if (currentPage > totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          }
                        }
                        if (pageNum <= totalPages) {
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              className={`h-8 w-8 text-sm rounded-lg ${
                                currentPage === pageNum
                                  ? 'bg-blue-500 text-white'
                                  : 'border-slate-300'
                              }`}
                            >
                              {pageNum}
                            </Button>
                          )
                        }
                        return null
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3 text-sm rounded-lg border-slate-300"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Compact Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteDialog.open && (
          <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, service: null })}>
            <DialogContent className="bg-white border border-slate-200 shadow-lg rounded-lg max-w-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <DialogHeader>
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-red-100 p-3 rounded-full">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <DialogTitle className="text-center text-lg font-semibold text-slate-900">
                    Delete Service?
                  </DialogTitle>
                  <DialogDescription className="text-center text-sm text-slate-600 mt-1">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-slate-900">"{deleteDialog.service?.title}"</span>?
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialog({ open: false, service: null })}
                    className="flex-1 h-9 rounded-lg border-slate-300 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="flex-1 h-9 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ServiceManagement