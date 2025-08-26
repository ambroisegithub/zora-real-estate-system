import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { toast } from 'sonner';

export enum NewsStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum NewsCategory {
  MARKET_TRENDS = 'market_trends',
  INVESTMENT_OPPORTUNITIES = 'investment_opportunities',
  LEGAL_UPDATES = 'legal_updates',
  PROJECT_LAUNCHES = 'project_launches',
  INDUSTRY_INSIGHTS = 'industry_insights'
}

export interface MarketNews {
  news_id: number;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  status: NewsStatus;
  featured_image?: string;
  read_time?: string;
  view_count: number;
  send_to_subscribers: boolean;
  published_at?: string;
  last_sent_at?: string;
  created_at: string;
  updated_at: string;
  created_by: {
    user_id: number;
    name: string;
    email: string;
  };
}

export interface Subscriber {
  email: string;
  first_name?: string;
  last_name?: string;
  subscribed_at: string;
  source?: string;
}

export interface NewsletterStatistics {
  subscribers: {
    total: number;
    new_today: number;
    new_this_week: number;
  };
  news: {
    total: number;
    published: number;
    draft: number;
    sent: number;
    total_views: number;
  };
  recent_news: MarketNews[];
}

export interface NewsletterFormData {
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  featured_image?: File | null;
  read_time?: string;
  send_to_subscribers: boolean;
  status?: NewsStatus;
}

interface NewsletterState {
  news: MarketNews[];
  currentNews: MarketNews | null;
  subscribers: Subscriber[];
  statistics: NewsletterStatistics | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  uploadProgress: number;
  sendingProgress: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status: NewsStatus | 'all';
    category: NewsCategory | 'all';
    search: string;
  };
}

const initialState: NewsletterState = {
  news: [],
  currentNews: null,
  subscribers: [],
  statistics: null,
  loading: false,
  error: null,
  success: false,
  uploadProgress: 0,
  sendingProgress: 0,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    status: 'all',
    category: 'all',
    search: ''
  }
};
export const createNews = createAsyncThunk(
  'newsletter/createNews',
  async (newsData: NewsletterFormData, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      
      // Debug what we're sending
      console.log("=== FRONTEND FORM DATA DEBUG ===");
      console.log("Original data:", newsData);
      
      // Append all fields including the file
      Object.entries(newsData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'featured_image' && value instanceof File) {
            formData.append(key, value);
            console.log(`Appended file: ${key}`, value.name, value.type, value.size);
          } else {
            formData.append(key, value.toString());
            console.log(`Appended field: ${key} = ${value}`);
          }
        }
      });

      // Verify FormData contents (for debugging)
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }
      console.log("===============================");

      const response = await api.post('/newsletter/news', formData, {
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

      console.log("Backend response:", response.data);
      toast.success('News article created successfully!');
      return response.data.data;
    } catch (error: any) {
      console.error("=== FRONTEND REQUEST ERROR ===");
      console.error("Error:", error);
      console.error("Error response:", error.response);
      console.error("==============================");
      
      const errorMessage = error.response?.data?.message || 'Failed to create news article';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(resetUploadProgress());
    }
  }
);

export const fetchNews = createAsyncThunk(
  'newsletter/fetchNews',
  async (params: {
    page?: number;
    limit?: number;
    status?: NewsStatus;
    category?: NewsCategory;
    search?: string;
    date_from?: string;
    date_to?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/newsletter/news', { params });
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch news';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchNewsById = createAsyncThunk(
  'newsletter/fetchNewsById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/newsletter/news/${id}`);
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch news article';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateNews = createAsyncThunk(
  'newsletter/updateNews',
  async ({ id, updates }: { id: number; updates: Partial<NewsletterFormData> }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'featured_image' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      if (updates.featured_image instanceof File) {
        formData.append('featured_image', updates.featured_image);
      }

      const response = await api.put(`/newsletter/news/${id}`, formData, {
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

      toast.success('News article updated successfully!');
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update news article';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(resetUploadProgress());
    }
  }
);

export const deleteNews = createAsyncThunk(
  'newsletter/deleteNews',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/newsletter/news/${id}`);
      toast.success('News article deleted successfully');
      return id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete news article';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchSubscribers = createAsyncThunk(
  'newsletter/fetchSubscribers',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/newsletter/subscribers', { params });
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch subscribers';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const sendNewsletter = createAsyncThunk(
  'newsletter/sendNewsletter',
  async (newsId: number, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setSendingProgress(0));
      
      const response = await api.post(`/newsletter/send/${newsId}`);
      
      // Simulate progress updates for better UX
      for (let progress = 10; progress <= 100; progress += 10) {
        setTimeout(() => {
          dispatch(setSendingProgress(progress));
        }, progress * 100);
      }

      toast.success('Newsletter sent successfully to all subscribers!');
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send newsletter';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    } finally {
      setTimeout(() => {
        dispatch(setSendingProgress(0));
      }, 2000);
    }
  }
);

export const fetchNewsletterStatistics = createAsyncThunk(
  'newsletter/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/newsletter/statistics');
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch statistics';
      return rejectWithValue(errorMessage);
    }
  }
);

// Newsletter Slice
const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
    setSendingProgress: (state, action: PayloadAction<number>) => {
      state.sendingProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setFilters: (state, action: PayloadAction<Partial<NewsletterState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        status: 'all',
        category: 'all',
        search: ''
      };
    },
    setCurrentNews: (state, action: PayloadAction<MarketNews | null>) => {
      state.currentNews = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create News
      .addCase(createNews.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.news.unshift(action.payload);
      })
      .addCase(createNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      
      // Fetch News
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload.news;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch News By ID
      .addCase(fetchNewsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNews = action.payload;
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update News
      .addCase(updateNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.news.findIndex(n => n.news_id === action.payload.news_id);
        if (index !== -1) {
          state.news[index] = action.payload;
        }
        if (state.currentNews?.news_id === action.payload.news_id) {
          state.currentNews = action.payload;
        }
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete News
      .addCase(deleteNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = state.news.filter(n => n.news_id !== action.payload);
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Subscribers
      .addCase(fetchSubscribers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscribers.fulfilled, (state, action) => {
        state.loading = false;
        state.subscribers = action.payload.subscribers;
      })
      .addCase(fetchSubscribers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Send Newsletter
      .addCase(sendNewsletter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendNewsletter.fulfilled, (state, action) => {
        state.loading = false;
        // Update the news item with send information
        const index = state.news.findIndex(n => n.news_id === action.payload.news_id);
        if (index !== -1) {
          state.news[index].last_sent_at = action.payload.sent_at;
          state.news[index].status = NewsStatus.PUBLISHED;
        }
      })
      .addCase(sendNewsletter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Statistics
      .addCase(fetchNewsletterStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNewsletterStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchNewsletterStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setUploadProgress,
  resetUploadProgress,
  setSendingProgress,
  clearError,
  clearSuccess,
  setFilters,
  resetFilters,
  setCurrentNews
} = newsletterSlice.actions;

// Selectors
export const selectNews = (state: { newsletter: NewsletterState }) => state.newsletter.news;
export const selectCurrentNews = (state: { newsletter: NewsletterState }) => state.newsletter.currentNews;
export const selectSubscribers = (state: { newsletter: NewsletterState }) => state.newsletter.subscribers;
export const selectStatistics = (state: { newsletter: NewsletterState }) => state.newsletter.statistics;
export const selectNewsletterLoading = (state: { newsletter: NewsletterState }) => state.newsletter.loading;
export const selectNewsletterError = (state: { newsletter: NewsletterState }) => state.newsletter.error;
export const selectUploadProgress = (state: { newsletter: NewsletterState }) => state.newsletter.uploadProgress;
export const selectSendingProgress = (state: { newsletter: NewsletterState }) => state.newsletter.sendingProgress;
export const selectNewsletterPagination = (state: { newsletter: NewsletterState }) => state.newsletter.pagination;
export const selectNewsletterFilters = (state: { newsletter: NewsletterState }) => state.newsletter.filters;

export default newsletterSlice.reducer;