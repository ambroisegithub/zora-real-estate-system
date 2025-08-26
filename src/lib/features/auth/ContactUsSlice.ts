import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { toast } from 'sonner';

export enum ContactCategory {
  GENERAL_INQUIRY = 'general_inquiry',
  INVESTMENT_CONSULTATION = 'investment_consultation',
  PROPERTY_INQUIRY = 'property_inquiry',
  SERVICES_QUESTION = 'services_question',
  SUPPORT_REQUEST = 'support_request',
  COMPLAINT = 'complaint',
  PARTNERSHIP = 'partnership',
  MEDIA_INQUIRY = 'media_inquiry'
}

export enum ContactStatus {
  NEW = 'new',
  READ = 'read',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum ContactPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface ContactAttachment {
  url: string;
  public_id: string;
  originalName: string;
  uploadedAt: string;
  fileType: string;
  fileSize: number;
}

export interface ContactUs {
  contact_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  category: ContactCategory;
  subject: string;
  message: string;
  status: ContactStatus;
  priority: ContactPriority;
  preferred_contact_method?: string;
  preferred_contact_time?: string;
  investment_budget?: string;
  location_interest?: string;
  property_type_interest?: string;
  timeline?: string;
  source?: string;
  attachments?: ContactAttachment[];
  admin_notes?: string;
  ip_address?: string;
  user_agent?: string;
  is_newsletter_subscribed: boolean;
  is_marketing_consent: boolean;
  response_sent_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: any;
  responded_by?: any;
}

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  category?: ContactCategory;
  subject: string;
  message: string;
  preferred_contact_method?: string;
  preferred_contact_time?: string;
  investment_budget?: string;
  location_interest?: string;
  property_type_interest?: string;
  timeline?: string;
  source?: string;
  is_newsletter_subscribed?: boolean;
  is_marketing_consent?: boolean;
  attachments?: File[];
}

export interface NewsletterSubscriptionData {
  email: string;
  first_name?: string;
  source?: string;
}

export interface ContactStatistics {
  overview: {
    total: number;
    new: number;
    read: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
  priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  categories: Array<{ category: string; count: number }>;
  recent_activity: Array<{ date: string; count: number }>;
  response_metrics: {
    average_response_hours: string;
    response_rate: string;
    overdue_count: number;
  };
}
interface ContactUsState {
  contacts: ContactUs[];
  currentContact: ContactUs | null;
  statistics: ContactStatistics | null | any; // Allow 'any' to handle different response structures
  loading: boolean;
  error: string | null;
  success: boolean;
  uploadProgress: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ContactUsState = {
  contacts: [],
  currentContact: null,
  statistics: null,
  loading: false,
  error: null,
  success: false,
  uploadProgress: 0,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  }
};

// Async Thunks
export const createContact = createAsyncThunk(
  'contactUs/createContact',
  async (contactData: ContactFormData, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      
      Object.entries(contactData).forEach(([key, value]) => {
        if (key !== 'attachments' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      if (contactData.attachments && contactData.attachments.length > 0) {
        contactData.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await api.post('/contact-us', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          dispatch(setUploadProgress(progress));
        }
      });

      toast.success('Message sent successfully! We will contact you soon.');
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(resetUploadProgress());
    }
  }
);

export const fetchContacts = createAsyncThunk(
  'contactUs/fetchContacts',
  async (params: {
    page?: number;
    limit?: number;
    status?: ContactStatus;
    priority?: ContactPriority;
    category?: ContactCategory;
    search?: string;
    date_from?: string;
    date_to?: string;
    assigned_to?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/contact-us', { params });
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch contacts';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchContactById = createAsyncThunk(
  'contactUs/fetchContactById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/contact-us/${id}`);
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch contact';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateContact = createAsyncThunk(
  'contactUs/updateContact',
  async ({ id, updates }: { id: number; updates: Partial<ContactUs> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/contact-us/${id}`, updates);
      toast.success('Contact updated successfully');
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update contact';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contactUs/deleteContact',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/contact-us/${id}`);
      toast.success('Contact deleted successfully');
      return id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete contact';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const respondToContact = createAsyncThunk(
  'contactUs/respondToContact',
  async ({ id, response_message }: { id: number; response_message: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/contact-us/${id}/respond`, { response_message });
      toast.success('Response sent successfully');
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send response';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchContactStatistics = createAsyncThunk(
  'contactUs/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/contact-us/statistics');
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch statistics';
      return rejectWithValue(errorMessage);
    }
  }
);

export const bulkUpdateContacts = createAsyncThunk(
  'contactUs/bulkUpdate',
  async ({ contact_ids, updates }: { contact_ids: number[]; updates: any }, { rejectWithValue }) => {
    try {
      const response = await api.put('/contact-us/bulk-update', { contact_ids, updates });
      toast.success(`${contact_ids.length} contacts updated successfully`);
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to bulk update contacts';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const subscribeNewsletter = createAsyncThunk(
  'contactUs/subscribeNewsletter',
  async (subscriptionData: NewsletterSubscriptionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/contact-us/newsletter-subscribe', subscriptionData);
      toast.success('Successfully subscribed to newsletter!');
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to subscribe to newsletter';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const exportContacts = createAsyncThunk(
  'contactUs/exportContacts',
  async (params: {
    status?: ContactStatus;
    priority?: ContactPriority;
    category?: ContactCategory;
    date_from?: string;
    date_to?: string;
    format?: 'csv' | 'json';
  } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/contact-us/export', { 
        params,
        responseType: params.format === 'csv' ? 'blob' : 'json'
      });
      
      if (params.format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `contacts-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Contacts exported successfully');
      }
      
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to export contacts';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ContactUs Slice
const contactUsSlice = createSlice({
  name: 'contactUs',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetContactState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.uploadProgress = 0;
    },
    setCurrentContact: (state, action: PayloadAction<ContactUs | null>) => {
      state.currentContact = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Contact
      .addCase(createContact.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      
      // Fetch Contacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
.addCase(fetchContacts.fulfilled, (state, action) => {
  state.loading = false;
  state.contacts = action.payload.contacts || action.payload.data?.contacts || [];
  state.pagination = action.payload.pagination || action.payload.data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  };
  
  // Handle different statistics structures from API
  if (action.payload.statistics) {
    state.statistics = action.payload.statistics;
  } else if (action.payload.data?.statistics) {
    state.statistics = action.payload.data.statistics;
  } else {
    state.statistics = null;
  }
})
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Contact By ID
      .addCase(fetchContactById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContact = action.payload;
      })
      .addCase(fetchContactById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Contact
      .addCase(updateContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.contacts.findIndex(c => c.contact_id === action.payload.contact_id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
        if (state.currentContact?.contact_id === action.payload.contact_id) {
          state.currentContact = action.payload;
        }
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Contact
      .addCase(deleteContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = state.contacts.filter(c => c.contact_id !== action.payload);
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Respond to Contact
      .addCase(respondToContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToContact.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(respondToContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Statistics
      .addCase(fetchContactStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContactStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchContactStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Bulk Update
      .addCase(bulkUpdateContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateContacts.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkUpdateContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Subscribe Newsletter
      .addCase(subscribeNewsletter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribeNewsletter.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(subscribeNewsletter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Export Contacts
      .addCase(exportContacts.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportContacts.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setUploadProgress,
  resetUploadProgress,
  clearError,
  clearSuccess,
  resetContactState,
  setCurrentContact
} = contactUsSlice.actions;

// Selectors
export const selectContacts = (state: { contactUs: ContactUsState }) => state.contactUs.contacts;
export const selectCurrentContact = (state: { contactUs: ContactUsState }) => state.contactUs.currentContact;
export const selectContactsLoading = (state: { contactUs: ContactUsState }) => state.contactUs.loading;
export const selectContactsError = (state: { contactUs: ContactUsState }) => state.contactUs.error;
export const selectContactStatistics = (state: { contactUs: ContactUsState }) => state.contactUs.statistics;
export const selectContactsPagination = (state: { contactUs: ContactUsState }) => state.contactUs.pagination;

export default contactUsSlice.reducer;