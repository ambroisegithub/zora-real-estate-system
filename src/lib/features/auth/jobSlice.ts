import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import api from '@/lib/api';
import { toast } from 'sonner';

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship'
}

export enum JobStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DRAFT = 'draft'
}

export interface Job {
  job_id: number;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  type: JobType;
  status: JobStatus;
  location: string;
  salary_range: string;
  department: string;
  application_deadline: string | null;
  is_active: boolean;
  experience_level: number;
  created_at: string;
  updated_at: string;
  created_by: {
    user_id: number;
    name: string;
    email: string;
  };
}

interface JobState {
  jobs: Job[];
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  filters: {
    type?: JobType;
    status?: JobStatus;
    department?: string;
    search?: string;
  };
}

const initialState: JobState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  filters: {},
};

// Async Thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params: {
    page?: number;
    limit?: number;
    type?: JobType;
    status?: JobStatus;
    department?: string;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/jobs', { params });
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch jobs');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch job');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job');
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData: {
    title: string;
    description: string;
    requirements: string;
    responsibilities: string;
    type: JobType;
    location: string;
    salary_range?: string;
    department?: string;
    application_deadline?: string;
    experience_level?: number;
    is_active?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/jobs', jobData);
      toast.success('Job created successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create job');
      return rejectWithValue(error.response?.data?.message || 'Failed to create job');
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, jobData }: { id: number; jobData: Partial<Job> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      toast.success('Job updated successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update job');
      return rejectWithValue(error.response?.data?.message || 'Failed to update job');
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted successfully!');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete job');
    }
  }
);

export const fetchActiveJobs = createAsyncThunk(
  'jobs/fetchActiveJobs',
  async (limit: number = 6, { rejectWithValue }) => {
    try {
      const response = await api.get('/jobs/active', { params: { limit } });
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch active jobs');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active jobs');
    }
  }
);

// Job Slice
const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<JobState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentJob: (state, action: PayloadAction<Job | null>) => {
      state.currentJob = action.payload;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs || [];
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Job By ID
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Job
      .addCase(createJob.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isCreating = false;
        state.jobs.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      // Update Job
      .addCase(updateJob.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.jobs.findIndex(
          (job) => job.job_id === action.payload.job_id
        );
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        if (state.currentJob?.job_id === action.payload.job_id) {
          state.currentJob = action.payload;
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      // Delete Job
      .addCase(deleteJob.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.jobs = state.jobs.filter(
          (job) => job.job_id !== action.payload
        );
        if (state.currentJob?.job_id === action.payload) {
          state.currentJob = null;
        }
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      })

      // Fetch Active Jobs
      .addCase(fetchActiveJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchActiveJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentJob,
  clearCurrentJob,
  clearError,
} = jobSlice.actions;

export const selectJobs = (state: RootState) => state.jobs.jobs;
export const selectCurrentJob = (state: RootState) => state.jobs.currentJob;
export const selectJobsLoading = (state: RootState) => state.jobs.loading;
export const selectJobsError = (state: RootState) => state.jobs.error;
export const selectJobsFilters = (state: RootState) => state.jobs.filters;

export default jobSlice.reducer;