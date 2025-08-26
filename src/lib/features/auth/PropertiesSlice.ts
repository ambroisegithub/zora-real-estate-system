import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import { toast } from "sonner"

// Types
export interface PropertyImage {
  url: string
  public_id: string
  originalName: string
  uploadedAt: string
}

export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  LAND = 'land',
  COMMERCIAL = 'commercial',
  VILLA = 'villa',
  CONDO = 'condo'
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RENTED = 'rented',
  PENDING = 'pending'
}

export interface Property {
  property_id: number
  title: string
  description: string
  price: number
  type: PropertyType
  location: string
  bedrooms?: number
  bathrooms?: number
  area_sq_m?: number
  status: PropertyStatus
  image_urls: PropertyImage[]
  is_featured: boolean
  address?: string
  city?: string
  district?: string
  amenities: string[]
  created_at: string
  updated_at: string
  created_by: {
    user_id: number
    name: string
    email: string
  }
}

interface PropertyFilters {
  search?: string
  type?: PropertyType
  status?: PropertyStatus
  minPrice?: number
  maxPrice?: number
  location?: string
  bedrooms?: number
  bathrooms?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

interface PropertyState {
  properties: Property[]
  currentProperty: Property | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: PropertyFilters
  uploadProgress: number
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

const initialState: PropertyState = {
  properties: [],
  currentProperty: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  },
  filters: {},
  uploadProgress: 0,
  isCreating: false,
  isUpdating: false,
  isDeleting: false
}

// Async Thunks
export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (params: {
    page?: number
    limit?: number
    search?: string
    type?: PropertyType
    status?: PropertyStatus
    minPrice?: number
    maxPrice?: number
    location?: string
    bedrooms?: number
    bathrooms?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
  } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/properties', { params })
      return response.data.data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch properties')
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties')
    }
  }
)

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchPropertyById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/properties/${id}`)
      return response.data.data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch property')
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property')
    }
  }
)

export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (propertyData: {
    title: string
    description: string
    price: number
    type: PropertyType
    location: string
    bedrooms?: number
    bathrooms?: number
    area_sq_m?: number
    address?: string
    city?: string
    district?: string
    amenities?: string[]
    is_featured?: boolean
    images?: File[]
  }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData()
      
      // Append property data
      Object.entries(propertyData).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) {
          if (key === 'amenities' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value.toString())
          }
        }
      })

      // Append images
      if (propertyData.images && propertyData.images.length > 0) {
        propertyData.images.forEach((image) => {
          formData.append('images', image)
        })
      }

      const response = await api.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          dispatch(setUploadProgress(progress))
        }
      })

      toast.success('Property created successfully!')
      return response.data.data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create property')
      return rejectWithValue(error.response?.data?.message || 'Failed to create property')
    } finally {
      dispatch(resetUploadProgress())
    }
  }
)

export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async ({ 
    id, 
    propertyData 
  }: {
    id: number
    propertyData: Partial<Property> & { images?: File[] }
  }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData()
      
      // Append property data
      Object.entries(propertyData).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) {
          if (key === 'amenities' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value.toString())
          }
        }
      })

      // Append new images
      if (propertyData.images && propertyData.images.length > 0) {
        propertyData.images.forEach((image) => {
          formData.append('documents', image)
        })
      }

      const response = await api.put(`/properties/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          dispatch(setUploadProgress(progress))
        }
      })

      toast.success('Property updated successfully!')
      return response.data.data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update property')
      return rejectWithValue(error.response?.data?.message || 'Failed to update property')
    } finally {
      dispatch(resetUploadProgress())
    }
  }
)

export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/properties/${id}`)
      toast.success('Property deleted successfully!')
      return id
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete property')
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property')
    }
  }
)

export const deletePropertyImage = createAsyncThunk(
  'properties/deletePropertyImage',
  async ({ propertyId, imageIndex }: { propertyId: number, imageIndex: number }, { rejectWithValue }) => {
    try {
      await api.delete(`/properties/${propertyId}/images/${imageIndex}`)
      toast.success('Image deleted successfully!')
      return { propertyId, imageIndex }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete image')
      return rejectWithValue(error.response?.data?.message || 'Failed to delete image')
    }
  }
)

export const fetchFeaturedProperties = createAsyncThunk(
  'properties/fetchFeaturedProperties',
  async (limit: number = 6, { rejectWithValue }) => {
    try {
      const response = await api.get('/properties/featured', { 
        params: { limit } 
      })
      // Return the actual properties array from response
      return response.data.data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch featured properties')
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured properties')
    }
  }
)

// Property Slice
const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setCurrentProperty: (state, action) => {
      state.currentProperty = action.payload
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false
        state.properties = action.payload.properties || []
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch Property By ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProperty = action.payload
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create Property
      .addCase(createProperty.pending, (state) => {
        state.isCreating = true
        state.error = null
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.isCreating = false
        if (action.payload) {
          state.properties.unshift(action.payload)
        }
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.isCreating = false
        state.error = action.payload as string
      })

      // Update Property
      .addCase(updateProperty.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.isUpdating = false
        if (action.payload) {
          const index = state.properties.findIndex(
            (prop) => prop.property_id === action.payload.property_id
          )
          if (index !== -1) {
            state.properties[index] = action.payload
          }
          if (state.currentProperty?.property_id === action.payload.property_id) {
            state.currentProperty = action.payload
          }
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

      // Delete Property
      .addCase(deleteProperty.pending, (state) => {
        state.isDeleting = true
        state.error = null
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.isDeleting = false
        state.properties = state.properties.filter(
          (prop) => prop.property_id !== action.payload
        )
        if (state.currentProperty?.property_id === action.payload) {
          state.currentProperty = null
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.isDeleting = false
        state.error = action.payload as string
      })

      // Delete Property Image
      .addCase(deletePropertyImage.pending, (state) => {
        state.loading = true
      })
      .addCase(deletePropertyImage.fulfilled, (state, action) => {
        state.loading = false
        const { propertyId, imageIndex } = action.payload
        
        // Update property in the list
        const propertyIndex = state.properties.findIndex(
          (prop) => prop.property_id === propertyId
        )
        if (propertyIndex !== -1) {
          state.properties[propertyIndex].image_urls.splice(imageIndex, 1)
        }
        
        // Update current property
        if (state.currentProperty?.property_id === propertyId) {
          state.currentProperty.image_urls.splice(imageIndex, 1)
        }
      })
      .addCase(deletePropertyImage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch Featured Properties - THIS IS THE FIX
      .addCase(fetchFeaturedProperties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFeaturedProperties.fulfilled, (state, action) => {
        state.loading = false
        // Store featured properties in the properties array
        state.properties = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchFeaturedProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setFilters,
  clearFilters,
  setCurrentProperty,
  clearCurrentProperty,
  setUploadProgress,
  resetUploadProgress,
  clearError
} = propertiesSlice.actions

// SELECTORS
export const selectProperties = (state: { properties: PropertyState }) => state.properties.properties
export const selectCurrentProperty = (state: { properties: PropertyState }) => state.properties.currentProperty
export const selectPropertiesLoading = (state: { properties: PropertyState }) => state.properties.loading
export const selectPropertiesError = (state: { properties: PropertyState }) => state.properties.error
export const selectPropertiesPagination = (state: { properties: PropertyState }) => state.properties.pagination
export const selectPropertiesFilters = (state: { properties: PropertyState }) => state.properties.filters
export const selectUploadProgress = (state: { properties: PropertyState }) => state.properties.uploadProgress
export const selectIsCreatingProperty = (state: { properties: PropertyState }) => state.properties.isCreating
export const selectIsUpdatingProperty = (state: { properties: PropertyState }) => state.properties.isUpdating
export const selectIsDeletingProperty = (state: { properties: PropertyState }) => state.properties.isDeleting

export default propertiesSlice.reducer