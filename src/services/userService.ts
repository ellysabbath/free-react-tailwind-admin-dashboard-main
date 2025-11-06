// services/userService.ts
const API_BASE_URL = 'http://localhost:8000/api/auth';

export interface UserData {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_admin?: boolean;
  date_joined?: string;
  agree_to_terms?: boolean;
  profile?: {
    bio?: string;
    phone?: string;
    location?: string;
    profile_picture?: string;
    country?: string;
    city_state?: string;
    region?: string;
    district?: string;
    registration_status?: string;
    academic_year?: string;
    gpa?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  profile?: {
    bio?: string;
    phone?: string;
    location?: string;
    country?: string;
    city_state?: string;
    region?: string;
    district?: string;
    registration_status?: string;
    academic_year?: string;
    gpa?: string;
    profile_picture?: string;
  };
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthHeaders = (): HeadersInit => {
  const accessToken = localStorage.getItem('access_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      
      if (typeof errorData === 'object') {
        // Handle different error formats
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          // Get first error from object
          const firstError = Object.values(errorData)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      // Handle specific HTTP status codes
      if (response.status === 401) {
        errorMessage = 'Please log in again';
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
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
    
    throw new ApiError(errorMessage, response.status);
  }
  
  return await response.json();
};

export const userService = {
  // ========== AUTHENTICATION CHECK ==========
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  // ========== PROFILE MANAGEMENT ==========
  
  // Get current user's profile
  async getProfile(): Promise<UserData> {
    if (!this.isAuthenticated()) {
      throw new ApiError('Please log in to access your profile', 401);
    }

    console.log('🔄 Fetching profile from:', `${API_BASE_URL}/profile/`);
    
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleApiResponse(response);
    
    // Update localStorage with fresh data
    if (data) {
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  },

  // Update current user's profile (PUT - full update)
  async updateProfile(userData: UpdateProfileData): Promise<{ message: string; user: UserData }> {
    if (!this.isAuthenticated()) {
      throw new ApiError('Please log in to update your profile', 401);
    }

    console.log('📤 Updating profile at:', `${API_BASE_URL}/profile/`);
    
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await handleApiResponse(response);
    
    // Update localStorage with fresh data
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Partially update current user's profile (PATCH - partial update)
  async partialUpdateProfile(userData: Partial<UpdateProfileData>): Promise<{ message: string; user: UserData }> {
    if (!this.isAuthenticated()) {
      throw new ApiError('Please log in to update your profile', 401);
    }

    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await handleApiResponse(response);
    
    // Update localStorage with fresh data
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Get current user data (quick access)
  async getCurrentUser(): Promise<UserData> {
    if (!this.isAuthenticated()) {
      throw new ApiError('Please log in to access your data', 401);
    }

    const response = await fetch(`${API_BASE_URL}/current-user/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleApiResponse(response);
    
    // Update localStorage with fresh data
    if (data) {
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  },

  // ========== LOCALSTORAGE HELPERS ==========
  getStoredUser(): UserData | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },

  getCurrentUserId(): number | null {
    const user = this.getStoredUser();
    return user?.id || null;
  },

  // ========== LOGOUT ==========
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // ========== DEBUG METHODS ==========
  debugAuthStatus(): string {
    const token = localStorage.getItem('access_token');
    const user = this.getStoredUser();
    
    return `Auth Status:
    Token: ${token ? '✅ Present' : '❌ Missing'}
    User: ${user ? '✅ Present' : '❌ Missing'}
    User ID: ${user?.id || 'N/A'}
    Username: ${user?.username || 'N/A'}
    Profile Data: ${user?.profile ? '✅ Present' : '❌ Missing'}
    `;
  }
};