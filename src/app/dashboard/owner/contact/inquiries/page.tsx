"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import {
    fetchContacts,
    deleteContact,
    respondToContact,
    bulkUpdateContacts,
    exportContacts,
    fetchContactStatistics,
    selectContacts,
    selectContactsLoading,
    selectContactStatistics,
    selectContactsPagination,
    ContactStatus,
    ContactPriority,
    ContactCategory,
    ContactUs
} from '@/lib/features/auth/ContactUsSlice'
import {
    Trash2,
    Search,
    Mail,
    Phone,
    Building2,
    Calendar,
    ArrowUpDown,
    Filter,
    Download,
    MailOpen,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Send,
    Eye,
    MoreVertical,
    User,
    MessageSquare,
    TrendingUp,
    Users,
    Inbox,
    FileText,
    Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Checkbox from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const ContactManagement = () => {
    const dispatch = useAppDispatch()

    const contacts = useAppSelector(selectContacts)
    const loading = useAppSelector(selectContactsLoading)
    const statistics = useAppSelector(selectContactStatistics)
    const pagination = useAppSelector(selectContactsPagination)

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
    const [priorityFilter, setPriorityFilter] = useState<ContactPriority | 'all'>('all')
    const [categoryFilter, setCategoryFilter] = useState<ContactCategory | 'all'>('all')
    const [selectedContacts, setSelectedContacts] = useState<number[]>([])
    const [sortField, setSortField] = useState<'created_at' | 'priority'>('created_at')
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; contact: ContactUs | null }>({
        open: false,
        contact: null
    })

    const [respondDialog, setRespondDialog] = useState<{ open: boolean; contact: ContactUs | null }>({
        open: false,
        contact: null
    })

    const [responseMessage, setResponseMessage] = useState('')
    const [viewDialog, setViewDialog] = useState<{ open: boolean; contact: ContactUs | null }>({
        open: false,
        contact: null
    })

    useEffect(() => {
        dispatch(fetchContacts({ page: 1, limit: 20, sortBy: sortField, sortOrder }))
        dispatch(fetchContactStatistics())
    }, [dispatch, sortField, sortOrder])

    const handleSearch = () => {
        const params: any = {
            page: 1,
            limit: 20,
            sortBy: sortField,
            sortOrder
        }

        if (searchTerm) params.search = searchTerm
        if (statusFilter !== 'all') params.status = statusFilter
        if (priorityFilter !== 'all') params.priority = priorityFilter
        if (categoryFilter !== 'all') params.category = categoryFilter

        dispatch(fetchContacts(params))
    }

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') {
                handleSearch()
            }
        }, 500)

        return () => clearTimeout(delayDebounce)
    }, [searchTerm, statusFilter, priorityFilter, categoryFilter])

    const handleSort = (field: typeof sortField) => {
        const newOrder = sortField === field && sortOrder === 'DESC' ? 'ASC' : 'DESC'
        setSortField(field)
        setSortOrder(newOrder)
    }

    const handleDelete = async () => {
        if (!deleteDialog.contact) return

        try {
            await dispatch(deleteContact(deleteDialog.contact.contact_id)).unwrap()
            setDeleteDialog({ open: false, contact: null })
            dispatch(fetchContacts({ page: pagination.page, limit: pagination.limit }))
        } catch (error) {
            console.error('Delete failed:', error)
        }
    }

    const handleRespond = async () => {
        if (!respondDialog.contact || !responseMessage.trim()) {
            toast.error('Please enter a response message')
            return
        }

        try {
            await dispatch(respondToContact({
                id: respondDialog.contact.contact_id,
                response_message: responseMessage
            })).unwrap()

            setRespondDialog({ open: false, contact: null })
            setResponseMessage('')
            dispatch(fetchContacts({ page: pagination.page, limit: pagination.limit }))
        } catch (error) {
            console.error('Response failed:', error)
        }
    }

    const handleBulkUpdate = async (updates: any) => {
        if (selectedContacts.length === 0) {
            toast.error('Please select contacts to update')
            return
        }

        try {
            await dispatch(bulkUpdateContacts({
                contact_ids: selectedContacts,
                updates
            })).unwrap()

            setSelectedContacts([])
            dispatch(fetchContacts({ page: pagination.page, limit: pagination.limit }))
        } catch (error) {
            console.error('Bulk update failed:', error)
        }
    }

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            await dispatch(exportContacts({ format })).unwrap()
        } catch (error) {
            console.error('Export failed:', error)
        }
    }

    const handlePageChange = (newPage: number) => {
        dispatch(fetchContacts({
            page: newPage,
            limit: pagination.limit,
            sortBy: sortField,
            sortOrder
        }))
    }

    const getStatusBadge = (status: ContactStatus) => {
        const statusConfig = {
            [ContactStatus.NEW]: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Inbox },
            [ContactStatus.READ]: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Eye },
            [ContactStatus.IN_PROGRESS]: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
            [ContactStatus.RESOLVED]: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            [ContactStatus.CLOSED]: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle }
        }

        const config = statusConfig[status]
        const Icon = config.icon

        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.replace('_', ' ')}
            </span>
        )
    }

    const getPriorityBadge = (priority: ContactPriority) => {
        const priorityConfig = {
            [ContactPriority.LOW]: 'bg-gray-100 text-gray-700 border-gray-200',
            [ContactPriority.MEDIUM]: 'bg-blue-100 text-blue-700 border-blue-200',
            [ContactPriority.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
            [ContactPriority.URGENT]: 'bg-red-100 text-red-700 border-red-200'
        }

        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${priorityConfig[priority]}`}>
                {priority.toUpperCase()}
            </span>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading && contacts.length === 0) {
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
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Contact Management</h1>
                                <p className="text-slate-600 text-sm">Manage customer inquiries and messages</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleExport('csv')}
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 rounded-lg border-slate-300"
                            >
                                <Download className="w-4 h-4 mr-1.5" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </motion.div>


                {/* Statistics Cards */}
                {statistics && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 lg:grid-cols-5 gap-3"
                    >
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-100">Total</p>
                                        <p className="text-2xl font-bold mt-1">{statistics?.overview?.total || 0}</p>
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Inbox className="w-4 h-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-100">New</p>
                                        <p className="text-2xl font-bold mt-1">{statistics?.overview?.new || 0}</p>
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-100">In Progress</p>
                                        <p className="text-2xl font-bold mt-1">{statistics?.overview?.in_progress || 0}</p>
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-100">Resolved</p>
                                        <p className="text-2xl font-bold mt-1">{statistics?.overview?.resolved || 0}</p>
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-100">Urgent</p>
                                        <p className="text-2xl font-bold mt-1">{statistics?.priority?.urgent || 0}</p>
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
                {/* Filters and Search */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
                >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Search contacts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-9 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                            <SelectTrigger className="h-9 text-sm rounded-lg border-slate-300">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {Object.values(ContactStatus).map(status => (
                                    <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                            <SelectTrigger className="h-9 text-sm rounded-lg border-slate-300">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                {Object.values(ContactPriority).map(priority => (
                                    <SelectItem key={priority} value={priority}>{priority.toUpperCase()}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                            <SelectTrigger className="h-9 text-sm rounded-lg border-slate-300">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {Object.values(ContactCategory).map(category => (
                                    <SelectItem key={category} value={category}>{category.replace(/_/g, ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedContacts.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                            <span className="text-sm text-slate-600">{selectedContacts.length} selected</span>
                            <Button
                                onClick={() => handleBulkUpdate({ status: ContactStatus.IN_PROGRESS })}
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs rounded"
                            >
                                Mark In Progress
                            </Button>
                            <Button
                                onClick={() => handleBulkUpdate({ status: ContactStatus.RESOLVED })}
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs rounded"
                            >
                                Mark Resolved
                            </Button>
                        </div>
                    )}
                </motion.div>

                {/* Contacts Table */}
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
                                        Contact Messages
                                    </CardTitle>
                                    <CardDescription className="text-sm text-slate-600">
                                        {pagination.total} total contacts
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                                        <tr>
                                            <th className="px-3 py-3 text-left w-10">
                                                <Checkbox
                                                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                                                    onCheckedChange={(checked) => {
                                                        setSelectedContacts(checked ? contacts.map(c => c.contact_id) : [])
                                                    }}
                                                />
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Contact Info
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                                                Category
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                                                <button
                                                    onClick={() => handleSort('priority')}
                                                    className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                                                >
                                                    Priority
                                                    <ArrowUpDown className="w-3 h-3" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                                                <button
                                                    onClick={() => handleSort('created_at')}
                                                    className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                                                >
                                                    Date
                                                    <ArrowUpDown className="w-3 h-3" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {contacts.length > 0 ? (
                                            contacts.map((contact, index) => (
                                                <motion.tr
                                                    key={contact.contact_id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.04 }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-3 py-3">
                                                        <Checkbox
                                                            checked={selectedContacts.includes(contact.contact_id)}
                                                            onCheckedChange={(checked) => {
                                                                setSelectedContacts(prev =>
                                                                    checked
                                                                        ? [...prev, contact.contact_id]
                                                                        : prev.filter(id => id !== contact.contact_id)
                                                                )
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {contact.first_name} {contact.last_name}
                                                            </div>


                                                            <div className="text-xs font-medium text-blue-600 mt-1">
                                                                {contact.subject}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 hidden lg:table-cell">
                                                        <span className="inline-block px-2 py-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded">
                                                            {contact.category.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {getStatusBadge(contact.status)}
                                                    </td>
                                                    <td className="px-3 py-3 hidden md:table-cell">
                                                        {getPriorityBadge(contact.priority)}
                                                    </td>
                                                    <td className="px-3 py-3 hidden xl:table-cell">
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                            {formatDate(contact.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setViewDialog({ open: true, contact })}
                                                                className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setRespondDialog({ open: true, contact })}
                                                                className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                                                                title="Respond"
                                                            >
                                                                <Send className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteDialog({ open: true, contact })}
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
                                                            <Inbox className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-700 mb-1">
                                                            No Contacts Found
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

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50">
                                    <p className="text-sm font-medium text-slate-600">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </p>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="h-8 px-3 text-sm rounded-lg border-slate-300"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.totalPages}
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

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, contact: null })}>
                <DialogContent className="bg-white max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-3">
                            <div className="bg-red-100 p-3 rounded-full">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center">Delete Contact?</DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure you want to delete this contact from{' '}
                            <span className="font-semibold">{deleteDialog.contact?.email}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, contact: null })}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            className="flex-1 bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Respond Dialog */}
            <Dialog open={respondDialog.open} onOpenChange={(open) => {
                setRespondDialog({ open, contact: null })
                setResponseMessage('')
            }}>
                <DialogContent className="bg-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Respond to Contact</DialogTitle>
                        <DialogDescription>
                            Send a response to {respondDialog.contact?.first_name} {respondDialog.contact?.last_name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">Original Message:</p>
                            <p className="text-sm text-slate-600 mt-1">{respondDialog.contact?.message}</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="response">Your Response</Label>
                            <Textarea
                                id="response"
                                value={responseMessage}
                                onChange={(e) => setResponseMessage(e.target.value)}
                                placeholder="Type your response here..."
                                className="min-h-[150px]"
                            />
                            <p className="text-xs text-slate-500">
                                This response will be sent to {respondDialog.contact?.email}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRespondDialog({ open: false, contact: null })
                                setResponseMessage('')
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRespond}
                            disabled={!responseMessage.trim()}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Send Response
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, contact: null })}>
                <DialogContent className="bg-white max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Contact Details</DialogTitle>
                        <DialogDescription>
                            Reference: #ZRE-{viewDialog.contact?.contact_id}
                        </DialogDescription>
                    </DialogHeader>

                    {viewDialog.contact && (
                        <div className="space-y-4">
                            {/* Contact Information */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Name</p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {viewDialog.contact.first_name} {viewDialog.contact.last_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Email</p>
                                    <p className="text-sm text-slate-900">{viewDialog.contact.email}</p>
                                </div>
                                {viewDialog.contact.phone && (
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase">Phone</p>
                                        <p className="text-sm text-slate-900">{viewDialog.contact.phone}</p>
                                    </div>
                                )}
                                {viewDialog.contact.company && (
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase">Company</p>
                                        <p className="text-sm text-slate-900">{viewDialog.contact.company}</p>
                                    </div>
                                )}
                            </div>

                            {/* Status and Priority */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Status</p>
                                    {getStatusBadge(viewDialog.contact.status)}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Priority</p>
                                    {getPriorityBadge(viewDialog.contact.priority)}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Category</p>
                                    <span className="inline-block px-2 py-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded">
                                        {viewDialog.contact.category.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>

                            {/* Subject and Message */}
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Subject</p>
                                <p className="text-sm font-semibold text-slate-900">{viewDialog.contact.subject}</p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Message</p>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{viewDialog.contact.message}</p>
                                </div>
                            </div>

                            {/* Additional Information */}
                            {(viewDialog.contact.investment_budget || viewDialog.contact.location_interest ||
                                viewDialog.contact.property_type_interest || viewDialog.contact.timeline) && (
                                    <div className="border-t pt-4">
                                        <p className="text-sm font-medium text-slate-700 mb-3">Additional Information</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {viewDialog.contact.investment_budget && (
                                                <div>
                                                    <p className="text-xs text-slate-500">Investment Budget</p>
                                                    <p className="text-sm text-slate-900">{viewDialog.contact.investment_budget}</p>
                                                </div>
                                            )}
                                            {viewDialog.contact.location_interest && (
                                                <div>
                                                    <p className="text-xs text-slate-500">Location Interest</p>
                                                    <p className="text-sm text-slate-900">{viewDialog.contact.location_interest}</p>
                                                </div>
                                            )}
                                            {viewDialog.contact.property_type_interest && (
                                                <div>
                                                    <p className="text-xs text-slate-500">Property Type</p>
                                                    <p className="text-sm text-slate-900">{viewDialog.contact.property_type_interest}</p>
                                                </div>
                                            )}
                                            {viewDialog.contact.timeline && (
                                                <div>
                                                    <p className="text-xs text-slate-500">Timeline</p>
                                                    <p className="text-sm text-slate-900">{viewDialog.contact.timeline}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Preferences */}
                            {(viewDialog.contact.preferred_contact_method || viewDialog.contact.preferred_contact_time) && (
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-slate-700 mb-3">Contact Preferences</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {viewDialog.contact.preferred_contact_method && (
                                            <div>
                                                <p className="text-xs text-slate-500">Preferred Method</p>
                                                <p className="text-sm text-slate-900">{viewDialog.contact.preferred_contact_method}</p>
                                            </div>
                                        )}
                                        {viewDialog.contact.preferred_contact_time && (
                                            <div>
                                                <p className="text-xs text-slate-500">Preferred Time</p>
                                                <p className="text-sm text-slate-900">{viewDialog.contact.preferred_contact_time}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Subscriptions */}
                            <div className="border-t pt-4">
                                <p className="text-sm font-medium text-slate-700 mb-2">Subscriptions</p>
                                <div className="flex gap-3">
                                    {viewDialog.contact.is_newsletter_subscribed && (
                                        <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Newsletter
                                        </span>
                                    )}
                                    {viewDialog.contact.is_marketing_consent && (
                                        <span className="inline-flex items-center px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Marketing
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Attachments */}
                            {viewDialog.contact.attachments && viewDialog.contact.attachments.length > 0 && (
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-slate-700 mb-2">Attachments</p>
                                    <div className="space-y-2">
                                        {viewDialog.contact.attachments.map((attachment, index) => (
                                            <a
                                                key={index}
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm text-slate-700">{attachment.originalName}</span>
                                                <span className="text-xs text-slate-500 ml-auto">
                                                    {(attachment.fileSize / 1024).toFixed(1)} KB
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            {viewDialog.contact.admin_notes && (
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-slate-700 mb-2">Admin Notes</p>
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm text-slate-700">{viewDialog.contact.admin_notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="border-t pt-4">
                                <p className="text-sm font-medium text-slate-700 mb-3">Timeline</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <Calendar className="w-3 h-3" />
                                        <span className="font-medium">Created:</span>
                                        <span>{formatDate(viewDialog.contact.created_at)}</span>
                                    </div>
                                    {viewDialog.contact.response_sent_at && (
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Send className="w-3 h-3" />
                                            <span className="font-medium">Response Sent:</span>
                                            <span>{formatDate(viewDialog.contact.response_sent_at)}</span>
                                        </div>
                                    )}
                                    {viewDialog.contact.resolved_at && (
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <CheckCircle className="w-3 h-3" />
                                            <span className="font-medium">Resolved:</span>
                                            <span>{formatDate(viewDialog.contact.resolved_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setViewDialog({ open: false, contact: null })}
                            className="w-full"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ContactManagement