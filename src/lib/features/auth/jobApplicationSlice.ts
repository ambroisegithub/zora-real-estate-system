import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import api from '@/lib/api';
import { toast } from 'sonner';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted'
}

export interface JobApplication {
  application_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  cv_url: string;
  additional_documents_url: string | null;
  status: ApplicationStatus;
  expected_salary: string | null;
  notice_period: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
  job: {
    job_id: number;
    title: string;
    department: string;
  };
}

interface JobApplicationState {
  applications: JobApplication[];
  currentApplication: JobApplication | null;
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  uploadProgress: number;
  filters: {
    status?: ApplicationStatus;
    job_id?: number;
  };
}

const initialState: JobApplicationState = {
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  uploadProgress: 0,
  filters: {},
};

// Async Thunks
export const fetchApplications = createAsyncThunk(
  'jobApplications/fetchApplications',
  async (params: {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
    job_id?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/job-applications', { params });
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch applications');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
    }
  }
);

export const fetchApplicationById = createAsyncThunk(
  'jobApplications/fetchApplicationById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/job-applications/${id}`);
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch application');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch application');
    }
  }
);

export const createJobApplication = createAsyncThunk(
  'jobApplications/createJobApplication',
  async (applicationData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    cover_letter?: string;
    job_id: number;
    expected_salary?: string;
    notice_period?: string;
    portfolio_url?: string;
    linkedin_url?: string;
    cv: File;
    additional_documents?: File;
  }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      
      // Append application data
      Object.entries(applicationData).forEach(([key, value]) => {
        if (key !== 'cv' && key !== 'additional_documents' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Append files
      formData.append('cv', applicationData.cv);
      if (applicationData.additional_documents) {
        formData.append('additional_documents', applicationData.additional_documents);
      }

      const response = await api.post('/job-applications', formData, {
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

      toast.success('Application submitted successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
      return rejectWithValue(error.response?.data?.message || 'Failed to submit application');
    } finally {
      dispatch(resetUploadProgress());
    }
  }
);

export const updateApplication = createAsyncThunk(
  'jobApplications/updateApplication',
  async ({ 
    id, 
    applicationData 
  }: {
    id: number;
    applicationData: Partial<JobApplication> & { cv?: File; additional_documents?: File };
  }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      
      // Append application data
      Object.entries(applicationData).forEach(([key, value]) => {
        if (key !== 'cv' && key !== 'additional_documents' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Append files if provided
      if (applicationData.cv) {
        formData.append('cv', applicationData.cv);
      }
      if (applicationData.additional_documents) {
        formData.append('additional_documents', applicationData.additional_documents);
      }

      const response = await api.put(`/job-applications/${id}`, formData, {
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

      toast.success('Application updated successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update application');
      return rejectWithValue(error.response?.data?.message || 'Failed to update application');
    } finally {
      dispatch(resetUploadProgress());
    }
  }
);

export const deleteApplication = createAsyncThunk(
  'jobApplications/deleteApplication',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/job-applications/${id}`);
      toast.success('Application deleted successfully!');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete application');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete application');
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'jobApplications/updateApplicationStatus',
  async ({ id, status }: { id: number; status: ApplicationStatus }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/job-applications/${id}/status`, { status });
      toast.success('Application status updated successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update application status');
      return rejectWithValue(error.response?.data?.message || 'Failed to update application status');
    }
  }
);

// Job Application Slice
const jobApplicationSlice = createSlice({
  name: 'jobApplications',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<JobApplicationState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentApplication: (state, action: PayloadAction<JobApplication | null>) => {
      state.currentApplication = action.payload;
    },
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
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
      // Fetch Applications
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload.applications || [];
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Application By ID
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentApplication = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Job Application
      .addCase(createJobApplication.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createJobApplication.fulfilled, (state, action) => {
        state.isCreating = false;
        state.applications.unshift(action.payload);
      })
      .addCase(createJobApplication.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      // Update Application
      .addCase(updateApplication.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.applications.findIndex(
          (app) => app.application_id === action.payload.application_id
        );
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
        if (state.currentApplication?.application_id === action.payload.application_id) {
          state.currentApplication = action.payload;
        }
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      // Delete Application
      .addCase(deleteApplication.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.applications = state.applications.filter(
          (app) => app.application_id !== action.payload
        );
        if (state.currentApplication?.application_id === action.payload) {
          state.currentApplication = null;
        }
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      })

      // Update Application Status
      .addCase(updateApplicationStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.applications.findIndex(
          (app) => app.application_id === action.payload.application_id
        );
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
        if (state.currentApplication?.application_id === action.payload.application_id) {
          state.currentApplication = action.payload;
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentApplication,
  clearCurrentApplication,
  setUploadProgress,
  resetUploadProgress,
  clearError,
} = jobApplicationSlice.actions;

export const selectApplications = (state: RootState) => state.jobApplications.applications;
export const selectCurrentApplication = (state: RootState) => state.jobApplications.currentApplication;
export const selectApplicationsLoading = (state: RootState) => state.jobApplications.loading;
export const selectApplicationsError = (state: RootState) => state.jobApplications.error;
export const selectApplicationsFilters = (state: RootState) => state.jobApplications.filters;
export const selectUploadProgress = (state: RootState) => state.jobApplications.uploadProgress;

export default jobApplicationSlice.reducer;