"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { useRouter } from "next/navigation"
import {
  fetchProperties,
  deleteProperty,
  Property,
  PropertyType,
  PropertyStatus
} from '@/lib/features/auth/PropertiesSlice'
import {
  Trash2,
  Edit,
  Plus,
  Search,
  Eye,
  MapPin,
  DollarSign,
  Home,
  Bed,
  Bath,
  Square,
  Filter,
  MoreVertical,
  ArrowUpDown,
  Calendar,
  Star,
  Building2,
  BarChart3,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const PropertyManagement = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const { properties, loading, isDeleting } = useAppSelector((state) => state.properties)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; property: Property | null }>({
    open: false,
    property: null
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<'title' | 'price' | 'created_at' | 'bedrooms'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const itemsPerPage = 10

  useEffect(() => {
    dispatch(fetchProperties({}))
  }, [dispatch])

  // Statistics
  const statistics = useMemo(() => {
    const total = properties.length
    const available = properties.filter(p => p.status === PropertyStatus.AVAILABLE).length
    const sold = properties.filter(p => p.status === PropertyStatus.SOLD).length
    const rented = properties.filter(p => p.status === PropertyStatus.RENTED).length
    const featured = properties.filter(p => p.is_featured).length
    const totalValue = properties.reduce((sum, prop) => sum + prop.price, 0)

    return { total, available, sold, rented, featured, totalValue }
  }, [properties])

  // Filtered and sorted properties
  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = typeFilter === 'all' ? true : property.type === typeFilter
      const matchesStatus = statusFilter === 'all' ? true : property.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
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
  }, [properties, searchTerm, typeFilter, statusFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProperties.slice(start, start + itemsPerPage)
  }, [filteredProperties, currentPage])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.property) return

    try {
      await dispatch(deleteProperty(deleteDialog.property.property_id)).unwrap()
      setDeleteDialog({ open: false, property: null })
      toast.success('Property deleted successfully')
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete property')
    }
  }

  const handleEdit = (propertyId: number) => {
    router.push(`/dashboard/owner/properties/create?id=${propertyId}`)
  }

  const handleView = (propertyId: number) => {
    router.push(`/properties/${propertyId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusBadge = (status: PropertyStatus) => {
    const statusConfig = {
      [PropertyStatus.AVAILABLE]: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      [PropertyStatus.SOLD]: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
      [PropertyStatus.RENTED]: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle },
      [PropertyStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getTypeBadge = (type: PropertyType) => {
    const typeConfig = {
      [PropertyType.HOUSE]: { color: 'bg-orange-100 text-orange-700 border-orange-200' },
      [PropertyType.APARTMENT]: { color: 'bg-blue-100 text-blue-700 border-blue-200' },
      [PropertyType.VILLA]: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      [PropertyType.CONDO]: { color: 'bg-purple-100 text-purple-700 border-purple-200' },
      [PropertyType.LAND]: { color: 'bg-amber-100 text-amber-700 border-amber-200' },
      [PropertyType.COMMERCIAL]: { color: 'bg-red-100 text-red-700 border-red-200' }
    }

    const config = typeConfig[type]

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
  }

  if (loading && properties.length === 0) {
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
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Property Management</h1>
                <p className="text-slate-600 text-sm">Manage and organize your property portfolio</p>
              </div>
            </div>
            
            <Button
              onClick={() => router.push('/dashboard/owner/properties/create')}
              className="h-9 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Property
            </Button>
          </div>
        </motion.div>

        {/* Compact Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-6 gap-3"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Properties</p>
                  <p className="text-2xl font-bold mt-1">{statistics.total}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Home className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-100">Available</p>
                  <p className="text-2xl font-bold mt-1">{statistics.available}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Sold</p>
                  <p className="text-2xl font-bold mt-1">{statistics.sold}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-100">Rented</p>
                  <p className="text-2xl font-bold mt-1">{statistics.rented}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-100">Featured</p>
                  <p className="text-2xl font-bold mt-1">{statistics.featured}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Star className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-100">Total Value</p>
                  <p className="text-lg font-bold mt-1">
                    {formatPrice(statistics.totalValue)}
                  </p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <DollarSign className="w-4 h-4" />
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
                placeholder="Search properties by title, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as PropertyType | 'all')}
                className="h-9 px-3 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {Object.values(PropertyType).map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | 'all')}
                className="h-9 px-3 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {Object.values(PropertyStatus).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Compact Properties Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-sm border border-gray-200 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Properties Directory
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {filteredProperties.length} properties found
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 border border-gray-200">
              <div className="overflow-x-auto border border-gray-200">
                <Table className="border border-gray-200">
                  <TableHeader className="bg-gradient-to-r from-blue-50 to-purple-100">
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('title')}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          Property Details
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Location
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('price')}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          Price
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">Type</TableHead>
                      <TableHead className="hidden xl:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        <button
                          onClick={() => handleSort('bedrooms')}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          Details
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="hidden xl:table-cell">
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          Created
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProperties.length > 0 ? (
                      paginatedProperties.map((property, index) => (
                        <motion.tr
                          key={property.property_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.04 }}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <TableCell className="text-center">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-600">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {property.image_urls && property.image_urls.length > 0 ? (
                                <img
                                  src={property.image_urls[0].url}
                                  alt={property.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                  <Home className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-semibold text-gray-900 truncate">
                                    {property.title}
                                  </div>
                                  {property.is_featured && (
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {property.description.substring(0, 60)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="truncate">{property.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm font-semibold text-gray-900">
                              <DollarSign className="w-3 h-3 mr-0.5 text-gray-500" />
                              {formatPrice(property.price)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getTypeBadge(property.type)}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {getStatusBadge(property.status)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              {property.bedrooms && (
                                <div className="flex items-center">
                                  <Bed className="w-3 h-3 mr-1" />
                                  {property.bedrooms}
                                </div>
                              )}
                              {property.bathrooms && (
                                <div className="flex items-center">
                                  <Bath className="w-3 h-3 mr-1" />
                                  {property.bathrooms}
                                </div>
                              )}
                              {property.area_sq_m && (
                                <div className="flex items-center">
                                  <Square className="w-3 h-3 mr-1" />
                                  {property.area_sq_m}m²
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                              {formatDate(property.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                  
                              <button
                                onClick={() => handleEdit(property.property_id)}
                                className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                                title="Edit Property"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteDialog({ open: true, property })}
                                className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                title="Delete Property"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                              <Search className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">
                              No Properties Found
                            </h3>
                            <p className="text-gray-500 text-sm">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Compact Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50">
                  <p className="text-sm font-medium text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                    <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredProperties.length)}</span> of{' '}
                    <span className="font-semibold text-slate-900">{filteredProperties.length}</span> properties
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
          <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, property: null })}>
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
                    Delete Property?
                  </DialogTitle>
                  <DialogDescription className="text-center text-sm text-slate-600 mt-1">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-slate-900">"{deleteDialog.property?.title}"</span>?
                    This action cannot be undone and all property data will be permanently removed.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialog({ open: false, property: null })}
                    className="flex-1 h-9 rounded-lg border-slate-300 text-sm"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="flex-1 h-9 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Delete
                      </>
                    )}
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

export default PropertyManagement