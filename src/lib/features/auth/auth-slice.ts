import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import api from "@/lib/api"
import Cookies from "js-cookie"


interface User {
  id: number 
  email: string
  name: string
  role: "admin" | "client" | "owner"
  phone: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  requiresPasswordReset: boolean
  resetUserId: number | null
  resetToken: string | null
}


const setToStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value)
  }
}

const removeFromStorage = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key)
  }
}

const initialState: AuthState = {
  token: Cookies.get("token") || null,
  user: Cookies.get("user") ? JSON.parse(Cookies.get("user") as string) : null,
  isAuthenticated: !!Cookies.get("token"),
  isLoading: false,
  error: null,
  requiresPasswordReset: false,
  resetUserId: null,
  resetToken: null,
}

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/auth/profile")
    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/profile", profileData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
 loginStart: (state) => {
      state.isLoading = true
      state.error = null
      state.requiresPasswordReset = false
      state.resetUserId = null
    },
loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
  state.token = action.payload.token
  state.user = action.payload.user
  state.isAuthenticated = true
  state.isLoading = false
  state.error = null
  
  Cookies.set("token", action.payload.token, { expires: 1 })
  Cookies.set("user", JSON.stringify(action.payload.user), { expires: 1 })
  setToStorage("token", action.payload.token)
  setToStorage("user", JSON.stringify(action.payload.user))
},
    loginFailure: (
      state,
      action: PayloadAction<{
        message: string
        requiresPasswordReset?: boolean
        userId?: number
        userType?: "user" | "employee"
      }>,
    ) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = action.payload.message
      state.requiresPasswordReset = action.payload.requiresPasswordReset || false
      state.resetUserId = action.payload.userId || null
      Cookies.remove("token")
      Cookies.remove("user")
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
      state.requiresPasswordReset = false
      state.resetUserId = null
      state.resetToken = null
      Cookies.remove("token")
      Cookies.remove("user")
    },
    clearAuthError: (state) => {
      state.error = null
    },
    verifyOTPStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    verifyOTPSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = null
      state.resetToken = action.payload // This token is now verified
      setToStorage("owner_reset_token", action.payload)
    },

    requestPasswordResetStart: (state) => {
      state.isLoading = true
      state.error = null
    },

   requestPasswordResetSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = null
      state.resetToken = action.payload
      setToStorage("owner_reset_token", action.payload)
    },
    requestPasswordResetFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.resetToken = null
      removeFromStorage("owner_reset_token")
    },


    resetPasswordStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    verifyOTPFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.resetToken = null
      removeFromStorage("hr_reset_token")
    },


    resetPasswordSuccess: (state) => {
      state.isLoading = false
      state.error = null
      state.requiresPasswordReset = false
      state.resetUserId = null
      state.resetToken = null
    },
    resetPasswordFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = { ...state.user, ...action.payload }
        if (state.user) {
          Cookies.set("user", JSON.stringify(state.user), { expires: 1 })
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = { ...state.user, ...action.payload }
        if (state.user) {
          Cookies.set("user", JSON.stringify(state.user), { expires: 1 })
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearAuthError,
  requestPasswordResetSuccess,
  requestPasswordResetFailure,
  verifyOTPSuccess,
  verifyOTPFailure,
  resetPasswordSuccess,
  resetPasswordFailure,
  verifyOTPStart,
  requestPasswordResetStart,
  resetPasswordStart,
} = authSlice.actions

export default authSlice.reducer
