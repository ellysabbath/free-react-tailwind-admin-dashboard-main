// services/authService.ts
import { 
  PasswordResetRequestData, 
  OTPVerificationData, 
  PasswordResetData, 
  ApiResponse,
  SignupData,
  AuthResponse,
  UserData,
  UpdateProfileData
} from '../types/auth';

const API_BASE_URL = 'http://localhost:8000';

// Define specific response types for profile operations
interface ProfileResponse {
  user: UserData;
  message?: string;
}

interface UploadProfilePictureResponse {
  user: UserData;
  message?: string;
}

interface TokenRefreshResponse {
  access: string;
}

// Helper function to get the token
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Helper function to check if token exists
const hasValidToken = (): boolean => {
  const token = getAuthToken();
  return !!token && token !== 'undefined' && token !== 'null';
};

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      
      if (typeof errorData === 'object') {
        const firstError = Object.values(errorData)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      if (response.status === 401) {
        errorMessage = 'Please log in again';
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to perform this action';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }
    } catch {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    
    throw new Error(errorMessage);
  }
  
  return await response.json();
};

// Extended LoginData interface that supports both username and email
interface ExtendedLoginData {
  username?: string;
  email?: string;
  password: string;
}

// Interface for login response with different possible structures
interface LoginResponseData {
  tokens?: {
    access: string;
    refresh: string;
  };
  access?: string;
  refresh?: string;
  token?: string;
  user?: UserData;
}

// Interface for signup response
interface SignupResponseData {
  message?: string;
  access?: string;
  refresh?: string;
  token?: string;
  user?: UserData;
}

export const authService = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return hasValidToken();
  },

  // Get auth token
  getAuthToken(): string {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  },

  // Get current user data
  getCurrentUser(): UserData | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Get current user ID
  getCurrentUserId(): number | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || null;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Login user - UPDATED TO SUPPORT BOTH USERNAME AND EMAIL
  async login(data: ExtendedLoginData): Promise<AuthResponse> {
    // Prepare login payload - prioritize username over email
    const loginPayload = data.username 
      ? { username: data.username, password: data.password }
      : { email: data.email, password: data.password };

    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginPayload),
    });

    const responseData = await handleApiResponse<LoginResponseData>(response);

    console.log('🔑 Login response:', responseData);

    // Handle different possible token structures
    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    let userData: UserData | null = null;

    if (responseData.tokens) {
      // New structure with nested tokens
      accessToken = responseData.tokens.access;
      refreshToken = responseData.tokens.refresh;
      userData = responseData.user || null;
    } else if (responseData.access) {
      // Direct token structure
      accessToken = responseData.access;
      refreshToken = responseData.refresh || null;
      userData = responseData.user || null;
    } else if (responseData.token) {
      // Simple token structure
      accessToken = responseData.token;
      userData = responseData.user || null;
    }

    if (!accessToken) {
      throw new Error('No access token received from server');
    }

    if (!userData) {
      throw new Error('No user data received from server');
    }

    // Store tokens and user data
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    
    localStorage.setItem('user', JSON.stringify(userData));

    console.log('✅ Tokens stored in localStorage');

    return {
      access: accessToken,
      refresh: refreshToken || '',
      user: userData
    };
  },

  // Signup user
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await handleApiResponse<SignupResponseData>(response);

    // If registration is successful but doesn't include tokens, 
    // return the success response without auto-login
    if (responseData.message && !responseData.access && !responseData.token) {
      // Create a minimal UserData object from SignupData with required fields
      // Generate a username from email if not provided
      const username = data.username || data.email.split('@')[0];
      
      const minimalUserData: UserData = {
        id: 0, // Temporary ID, will be updated after verification
        email: data.email,
        username: username,
        first_name: data.first_name,
        last_name: data.last_name,
        profile: {
          username: username
        }
      };

      return {
        access: '',
        refresh: '',
        user: responseData.user || minimalUserData
      };
    }

    // If tokens are included, store them
    if (responseData.access || responseData.token) {
      let accessToken = '';
      let refreshToken = '';
      let userData: UserData | null = null;

      if (responseData.access) {
        accessToken = responseData.access;
        refreshToken = responseData.refresh || '';
        userData = responseData.user || null;
      } else if (responseData.token) {
        accessToken = responseData.token;
        userData = responseData.user || null;
      }

      if (accessToken && userData) {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return {
        access: accessToken,
        refresh: refreshToken,
        user: userData!
      };
    }

    // Fallback return for unexpected cases
    // Generate a username from email if not provided
    const fallbackUsername = data.username || data.email.split('@')[0];
    
    const fallbackUserData: UserData = {
      id: 0,
      email: data.email,
      username: fallbackUsername,
      first_name: data.first_name,
      last_name: data.last_name,
      profile: {
        username: fallbackUsername
      }
    };

    return {
      access: '',
      refresh: '',
      user: fallbackUserData
    };
  },

  // Logout user
  async logout(): Promise<void> {
    const token = getAuthToken();
    
    if (token) {
      try {
        // Call logout endpoint to invalidate token on server
        await fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue with local logout even if API call fails
      }
    }

    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Refresh token
  async refreshToken(): Promise<TokenRefreshResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const responseData = await handleApiResponse<TokenRefreshResponse>(response);

    localStorage.setItem('access_token', responseData.access);
    return responseData;
  },

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/email-verify/?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleApiResponse<ApiResponse>(response);
  },

  // Get auth headers for API calls
  getAuthHeaders(contentType: string = 'application/json'): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
    };
    
    // Only set Content-Type if it's not FormData (browser will set it automatically for FormData)
    if (contentType !== 'multipart/form-data') {
      headers['Content-Type'] = contentType;
    }
    
    return headers;
  },

  // Request password reset OTP
  async requestPasswordReset(data: PasswordResetRequestData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/password-reset/request/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email
      }),
    });

    return handleApiResponse<ApiResponse>(response);
  },

  // Verify OTP
  async verifyOTP(data: OTPVerificationData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/password-reset/verify-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        otp: data.otp
      }),
    });

    return handleApiResponse<ApiResponse>(response);
  },

  // Reset password
  async resetPassword(data: PasswordResetData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/password-reset/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
        verification_token: data.verification_token
      }),
    });

    return handleApiResponse<ApiResponse>(response);
  },

  // Update user profile
  async updateProfile(data: UpdateProfileData | FormData): Promise<ProfileResponse> {
    const isFormData = data instanceof FormData;
    
    const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(isFormData ? 'multipart/form-data' : 'application/json'),
      body: isFormData ? data : JSON.stringify(data),
    });

    const responseData = await handleApiResponse<ProfileResponse>(response);
    
    // Update localStorage with fresh user data
    if (responseData.user) {
      localStorage.setItem('user', JSON.stringify(responseData.user));
    }
    
    return responseData;
  },

  // Upload profile picture only
  async uploadProfilePicture(file: File): Promise<UploadProfilePictureResponse> {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
      method: 'PUT',
      headers: this.getAuthHeaders('multipart/form-data'),
      body: formData,
    });

    const responseData = await handleApiResponse<UploadProfilePictureResponse>(response);
    
    // Update localStorage with fresh user data
    if (responseData.user) {
      localStorage.setItem('user', JSON.stringify(responseData.user));
    }
    
    return responseData;
  },

  // Get user profile
  async getProfile(): Promise<UserData> {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const userData = await handleApiResponse<UserData>(response);
    
    // Update localStorage with fresh user data
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  },

  // Get current user data (quick access)
  async getCurrentUserData(): Promise<UserData> {
    const response = await fetch(`${API_BASE_URL}/api/auth/current-user/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const userData = await handleApiResponse<UserData>(response);
    
    // Update localStorage with fresh user data
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  },

  // Debug method to check authentication status
  debugAuthStatus(): { 
    isAuthenticated: boolean; 
    hasUser: boolean; 
    userId: number | null;
    tokenPresent: boolean;
    token: string | null;
  } {
    const token = localStorage.getItem('access_token');
    
    return {
      isAuthenticated: this.isAuthenticated(),
      hasUser: !!localStorage.getItem('user'),
      userId: this.getCurrentUserId(),
      tokenPresent: !!token,
      token: token
    };
  },

  // Clear all auth data
  clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};