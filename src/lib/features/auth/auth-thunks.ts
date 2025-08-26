import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  loginStart,
  loginSuccess,
  loginFailure,
  requestPasswordResetSuccess,
  requestPasswordResetFailure,
  verifyOTPSuccess,
  verifyOTPFailure,
  resetPasswordSuccess,
  resetPasswordFailure,
} from "./auth-slice"

interface LoginCredentials {
  username: string
  password: string
}

interface PasswordResetRequest {
  email: string
}

interface OTPVerification {
  resetToken: string
  otp: string
}

interface PasswordReset {
  resetToken: string
  newPassword: string
}

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart())
      const response = await api.post("/auth/login", credentials)

      if (response.data.success) {
        dispatch(loginSuccess(response.data.data))
        return response.data.data
      } else {
        dispatch(loginFailure({ message: response.data.message }))
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed"
      const errorData = error.response?.data?.data

      if (errorData?.requires_password_reset) {
        dispatch(
          loginFailure({
            message: errorMessage,
            requiresPasswordReset: true,
            userId: errorData.user_id,
            userType: errorData.user_type,
          }),
        )
      } else {
        dispatch(loginFailure({ message: errorMessage }))
      }
      return rejectWithValue(errorMessage)
    }
  },
)

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (data: PasswordResetRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart())
      const response = await api.post("/auth/request-password-reset", data)

      if (response.data.success) {
        dispatch(requestPasswordResetSuccess(response.data.data.resetToken))
        return response.data.data.resetToken
      } else {
        dispatch(requestPasswordResetFailure(response.data.message))
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Password reset request failed"
      dispatch(requestPasswordResetFailure(errorMessage))
      return rejectWithValue(errorMessage)
    }
  },
)

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (data: OTPVerification, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart())
      const response = await api.post("/auth/verify-otp", data)

      if (response.data.success) {
        dispatch(verifyOTPSuccess(response.data.data.resetToken))
        return response.data.data.resetToken
      } else {
        dispatch(verifyOTPFailure(response.data.message))
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "OTP verification failed"
      dispatch(verifyOTPFailure(errorMessage))
      return rejectWithValue(errorMessage)
    }
  },
)

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: PasswordReset, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart())
      const response = await api.post("/auth/reset-password", data)

      if (response.data.success) {
        dispatch(resetPasswordSuccess())
        return response.data
      } else {
        dispatch(resetPasswordFailure(response.data.message))
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Password reset failed"
      dispatch(resetPasswordFailure(errorMessage))
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/auth/profile")

    if (response.data.success) {
      return response.data.data
    } else {
      return rejectWithValue(response.data.message)
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to fetch profile"
    return rejectWithValue(errorMessage)
  }
})

export const updateProfile = createAsyncThunk("auth/updateProfile", async (profileData: any, { rejectWithValue }) => {
  try {
    const response = await api.put("/auth/profile", profileData)

    if (response.data.success) {
      return response.data.data
    } else {
      return rejectWithValue(response.data.message)
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to update profile"
    return rejectWithValue(errorMessage)
  }
})
