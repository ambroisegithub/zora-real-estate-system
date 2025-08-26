import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Service {
  service_id: number;
  title: string;
  description: string;
  icon_name: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface ServiceState {
  services: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  uploadProgress: number;
  filters: {
    active_only: boolean;
    search: string;
  };
}

const initialState: ServiceState = {
  services: [],
  currentService: null,
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  uploadProgress: 0,
  filters: {
    active_only: true,
    search: '',
  },
};

// Async Thunks
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (params: { active_only?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/services', { params });
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch services');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch service');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service');
    }
  }
);

export const createService = createAsyncThunk(
  'services/createService',
  async (serviceData: FormData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/services', serviceData, {
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

      toast.success('Service created successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create service');
      return rejectWithValue(error.response?.data?.message || 'Failed to create service');
    } finally {
      dispatch(resetUploadProgress());
    }
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, serviceData }: { id: number; serviceData: FormData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/services/${id}`, serviceData, {
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

      toast.success('Service updated successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update service');
      return rejectWithValue(error.response?.data?.message || 'Failed to update service');
    } finally {
      dispatch(resetUploadProgress());
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted successfully!');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

// Service Slice
const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ServiceState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentService: (state, action: PayloadAction<Service | null>) => {
      state.currentService = action.payload;
    },
    clearCurrentService: (state) => {
      state.currentService = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Service By ID
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Service
      .addCase(createService.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.isCreating = false;
        state.services.push(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      // Update Service
      .addCase(updateService.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.services.findIndex(
          (service) => service.service_id === action.payload.service_id
        );
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        if (state.currentService?.service_id === action.payload.service_id) {
          state.currentService = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      // Delete Service
      .addCase(deleteService.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.services = state.services.filter(
          (service) => service.service_id !== action.payload
        );
        if (state.currentService?.service_id === action.payload) {
          state.currentService = null;
        }
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentService,
  clearCurrentService,
  setUploadProgress,
  resetUploadProgress,
  clearError,
} = serviceSlice.actions;

export const selectServices = (state: RootState) => state.services.services;
export const selectCurrentService = (state: RootState) => state.services.currentService;
export const selectServicesLoading = (state: RootState) => state.services.loading;
export const selectServicesError = (state: RootState) => state.services.error;
export const selectServicesFilters = (state: RootState) => state.services.filters;

export default serviceSlice.reducer;