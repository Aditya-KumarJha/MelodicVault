import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../services/axiosInstance';

// 1. Register User
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {

      const response = await axiosInstance.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.log("Error during registration API call:", error?.response?.data);
      return rejectWithValue(
        error?.response?.data || error.message
      );
    }
  }
);

// 2. Verify Registration OTP
export const verifyRegisterOtp = createAsyncThunk(
  'auth/verifyRegisterOtp',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/auth/verify-register-otp', verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// 3. Login User
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {

    try {
      const response = await axiosInstance.post('/api/auth/login', userData);
 
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// 4. Verify Login OTP
export const verifyLoginOtp = createAsyncThunk(
  'auth/verifyLoginOtp',
  async (verificationData, { rejectWithValue }) => {

    try {
      const response = await axiosInstance.post('/api/auth/verify-login-otp', verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// 5. Resend Verification OTP
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (data, { rejectWithValue }) => {

    try {
      const response = await axiosInstance.post('/api/auth/resend-otp', data);
   
      return response.data;
    } catch (error) {
      console.error("Error during resend OTP API call:", error);
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// 6. Logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/api/auth/logout');
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// 7. Check Authenticated User Session
export const checkAuthUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 8. Forgot Password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
   
    try {
      const response = await axiosInstance.post('/api/auth/forgot-password', data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// 9. Verify Forgot Password OTP
export const verifyForgotPasswordOtp = createAsyncThunk(
  'auth/verifyForgotPasswordOtp',
  async (data, { rejectWithValue }) => {
  
    try {
      const response = await axiosInstance.post('/api/auth/verify-forgot-password-otp', data);
    
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// 10. Reset Password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
   
    try {
      const response = await axiosInstance.post('/api/auth/reset-password', data);
    
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// 11. Refresh Token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/auth/refresh-token');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: true,
  error: null,
  isOtpRequired: false, 
  userEmail: null,
  authType: null // Controls UI routing between forms and OTP input
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserEmail: (state, action) => {
      state.userEmail = action.payload;
    },
    setAuthUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.isInitialized = true;
    },
    resetAuthState: (state) => {
      state.isOtpRequired = false;
      state.userEmail = null;
      state.authType = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.isOtpRequired = true;
        state.authType = "register";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify Register OTP Cases
      .addCase(verifyRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRegisterOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data?.user || action.payload.user || action.payload;
        state.isOtpRequired = false;
      })
      .addCase(verifyRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        state.isOtpRequired = true;
        state.authType = "login";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify Login OTP Cases
      .addCase(verifyLoginOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data?.user || action.payload.user || action.payload;
        state.isOtpRequired = false;
      })
      .addCase(verifyLoginOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Resend OTP Cases
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isOtpRequired = false;
        state.userEmail = null;
        state.authType = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check User Session Cases
      .addCase(checkAuthUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.isInitialized = true
        state.user = action.payload?.user || action.payload;
      })
      .addCase(checkAuthUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true
      })

      // Refresh Token Cases
      .addCase(refreshToken.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        state.isOtpRequired = false;
        state.authType = null;
      })

      // Forgot Password Cases
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyForgotPasswordOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyForgotPasswordOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyForgotPasswordOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuthUser, setUserEmail, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
