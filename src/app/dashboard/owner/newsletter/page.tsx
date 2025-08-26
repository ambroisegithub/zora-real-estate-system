"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { useRouter } from "next/navigation"
import {
  fetchNews,
  deleteNews,
  sendNewsletter,
  fetchSubscribers,
  fetchNewsletterStatistics,
  selectNews,
  selectSubscribers,
  selectStatistics,
  selectNewsletterLoading,
  selectNewsletterPagination,
  selectNewsletterFilters,
  setFilters,
  NewsStatus,
  NewsCategory,
  MarketNews
} from '@/lib/features/auth/newsletterSlice'
import {
  Trash2,
  Edit,
  Plus,
  Search,
  Mail,
  Send,
  Eye,
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Filter,
  MoreVertical,
  ArrowUpDown,
  CheckCircle,
  Clock,
  Archive,
  AlertCircle,
  Sparkles,
  Image as ImageIcon
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const NewsletterManagementPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const news = useAppSelector(selectNews)
  const subscribers = useAppSelector(selectSubscribers)
  const statistics = useAppSelector(selectStatistics)
  const loading = useAppSelector(selectNewsletterLoading)
  const pagination = useAppSelector(selectNewsletterPagination)
  const filters = useAppSelector(selectNewsletterFilters)

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; news: MarketNews | null }>({
    open: false,
    news: null
  })
  const [sendDialog, setSendDialog] = useState<{ open: boolean; news: MarketNews | null }>({
    open: false,
    news: null
  })
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; news: MarketNews | null }>({
    open: false,
    news: null
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<'created_at' | 'title' | 'view_count'>('created_at')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')

  useEffect(() => {
    dispatch(fetchNews({ 
      page: currentPage, 
      limit: 8,
      sortBy: sortField,
      sortOrder,
      ...(filters.status !== 'all' && { status: filters.status as NewsStatus }),
      ...(filters.category !== 'all' && { category: filters.category as NewsCategory }),
      ...(filters.search && { search: filters.search })
    }))
    dispatch(fetchSubscribers())
    dispatch(fetchNewsletterStatistics())
  }, [dispatch, currentPage, sortField, sortOrder, filters])

  const handleSearch = (value: string) => {
    dispatch(setFilters({ search: value }))
  }

  const handleStatusFilter = (status: NewsStatus | 'all') => {
    dispatch(setFilters({ status }))
  }

  const handleCategoryFilter = (category: NewsCategory | 'all') => {
    dispatch(setFilters({ category }))
  }

  const handleSort = (field: typeof sortField) => {
    const newOrder = sortField === field && sortOrder === 'DESC' ? 'ASC' : 'DESC'
    setSortField(field)
    setSortOrder(newOrder)
  }

  const handleDelete = async () => {
    if (!deleteDialog.news) return

    try {
      await dispatch(deleteNews(deleteDialog.news.news_id)).unwrap()
      setDeleteDialog({ open: false, news: null })
      toast.success('News article deleted successfully')
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete news article')
    }
  }

  const handleSendNewsletter = async () => {
    if (!sendDialog.news) return

    try {
      await dispatch(sendNewsletter(sendDialog.news.news_id)).unwrap()
      setSendDialog({ open: false, news: null })
    } catch (error) {
      console.error('Send failed:', error)
    }
  }

  const getStatusBadge = (status: NewsStatus) => {
    const statusConfig = {
      [NewsStatus.DRAFT]: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText },
      [NewsStatus.PUBLISHED]: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      [NewsStatus.ARCHIVED]: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Archive }
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

  const getCategoryBadge = (category: NewsCategory) => {
    const categoryConfig = {
      [NewsCategory.MARKET_TRENDS]: 'bg-blue-100 text-blue-700 border-blue-200',
      [NewsCategory.INVESTMENT_OPPORTUNITIES]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [NewsCategory.LEGAL_UPDATES]: 'bg-amber-100 text-amber-700 border-amber-200',
      [NewsCategory.PROJECT_LAUNCHES]: 'bg-purple-100 text-purple-700 border-purple-200',
      [NewsCategory.INDUSTRY_INSIGHTS]: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${categoryConfig[category]}`}>
        {category.replace(/_/g, ' ')}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading && news.length === 0) {
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
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Newsletter Management</h1>
                <p className="text-slate-600 text-sm">Create and manage market news newsletters</p>
              </div>
            </div>
            
            <Button
              onClick={() => router.push('/dashboard/owner/newsletter/create')}
              className="h-9 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create News
            </Button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {statistics && (
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
                    <p className="text-sm font-medium text-blue-100">Total Subscribers</p>
                    <p className="text-2xl font-bold mt-1">{statistics.subscribers.total}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-100">Published News</p>
                    <p className="text-2xl font-bold mt-1">{statistics.news.published}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-100">Total Views</p>
                    <p className="text-2xl font-bold mt-1">{statistics.news.total_views}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-100">Newsletters Sent</p>
                    <p className="text-2xl font-bold mt-1">{statistics.news.sent}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
                placeholder="Search news articles..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-9 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 px-3 text-sm rounded-lg border-slate-300">
                    <Filter className="w-4 h-4 mr-1.5" />
                    Status: {filters.status === 'all' ? 'All' : filters.status}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleStatusFilter('all')}>
                    All Status
                  </DropdownMenuItem>
                  {Object.values(NewsStatus).map(status => (
                    <DropdownMenuItem key={status} onClick={() => handleStatusFilter(status)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 px-3 text-sm rounded-lg border-slate-300">
                    <Filter className="w-4 h-4 mr-1.5" />
                    Category: {filters.category === 'all' ? 'All' : filters.category.replace(/_/g, ' ')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleCategoryFilter('all')}>
                    All Categories
                  </DropdownMenuItem>
                  {Object.values(NewsCategory).map(category => (
                    <DropdownMenuItem key={category} onClick={() => handleCategoryFilter(category)}>
                      {category.replace(/_/g, ' ')}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {/* News Articles Table */}
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
                    Market News Articles
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {pagination.total} articles found
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-10">#</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('title')}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          Article Details
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                        Category
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                        <button
                          onClick={() => handleSort('view_count')}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          Views
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
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {news.length > 0 ? (
                      news.map((article, index) => (
                        <motion.tr
                          key={article.news_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.04 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-3 text-center">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-600">
                                {(currentPage - 1) * 8 + index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              {article.featured_image ? (
                                <img
                                  src={article.featured_image}
                                  alt={article.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                  <ImageIcon className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                                  {article.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {article.summary}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden lg:table-cell">
                            {getCategoryBadge(article.category)}
                          </td>
                          <td className="px-3 py-3">
                            {getStatusBadge(article.status)}
                          </td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <div className="flex items-center text-sm text-gray-600">
                              <Eye className="w-3 h-3 mr-1 text-gray-400" />
                              {article.view_count}
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden xl:table-cell">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                              {formatDate(article.created_at)}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setPreviewDialog({ open: true, news: article })}
                                className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/dashboard/owner/newsletter/${article.news_id}`)}
                                className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {article.status === NewsStatus.PUBLISHED && !article.last_sent_at && (
                                <button
                                  onClick={() => setSendDialog({ open: true, news: article })}
                                  className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors"
                                  title="Send Newsletter"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteDialog({ open: true, news: article })}
                                className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                              <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">
                              No News Articles Found
                            </h3>
                            <p className="text-gray-500 text-sm">
                              Try adjusting your search or filters, or create your first news article
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50">
                  <p className="text-sm font-medium text-slate-600">
                    Page {currentPage} of {pagination.totalPages}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, news: null })}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-3">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Delete News Article?</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete "{deleteDialog.news?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, news: null })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Newsletter Dialog */}
      <Dialog open={sendDialog.open} onOpenChange={(open) => setSendDialog({ open, news: null })}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-3">
              <div className="bg-amber-100 p-3 rounded-full">
                <Send className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Send Newsletter?</DialogTitle>
            <DialogDescription className="text-center">
              This will send "{sendDialog.news?.title}" to all {statistics?.subscribers.total} subscribers.
              Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSendDialog({ open: false, news: null })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendNewsletter}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog.open} onOpenChange={(open) => setPreviewDialog({ open, news: null })}>
        <DialogContent className="bg-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Article Preview</DialogTitle>
            <DialogDescription>
              Preview of: {previewDialog.news?.title}
            </DialogDescription>
          </DialogHeader>

          {previewDialog.news && (
            <div className="space-y-4">
              {previewDialog.news.featured_image && (
                <img
                  src={previewDialog.news.featured_image}
                  alt={previewDialog.news.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div>
                <h2 className="text-xl font-bold text-gray-900">{previewDialog.news.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {previewDialog.news.category.replace(/_/g, ' ')}
                  </span>
                  <span>{previewDialog.news.read_time || '3 min read'}</span>
                  <span>{formatDate(previewDialog.news.created_at)}</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{previewDialog.news.summary}</p>
                <div className="mt-4 text-gray-800 whitespace-pre-wrap">
                  {previewDialog.news.content}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  {previewDialog.news.view_count} views • 
                  Created by {previewDialog.news.created_by.name}
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(previewDialog.news.status)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NewsletterManagementPage