// services/profileService.ts
import { UserData, UpdateProfileData } from '../types/auth';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:8000';

export const profileService = {
  // Get user profile
  async getUserProfile(): Promise<UserData> {
    console.log('🔍 Checking authentication...');
    console.log('Is authenticated:', authService.isAuthenticated());
    
    if (!authService.isAuthenticated()) {
      console.log('❌ No valid token found');
      throw new Error('No authentication token found. Please log in again.');
    }

    try {
      const headers = authService.getAuthHeaders();
      console.log('📤 Headers being sent:', headers);
      console.log('🔑 Token being sent:', localStorage.getItem('access_token'));

      const response = await fetch(`${API_BASE_URL}/api/profile/`, {
        method: 'GET',
        headers: headers,
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response body:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }

        if (response.status === 401) {
          authService.logout();
          throw new Error('Session expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error(`Access forbidden: ${errorData.detail || 'Authentication credentials were not provided'}`);
        }
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Profile data received:', data);
      return data;

    } catch (error) {
      console.error('🚨 Fetch error:', error);
      throw error;
    }
  },

  // Update user profile (keep existing)
  async updateUserProfile(data: UpdateProfileData): Promise<UserData> {
    if (!authService.isAuthenticated()) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const headers = authService.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/profile/update/`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 401) {
        authService.logout();
        throw new Error('Session expired. Please log in again.');
      } else if (response.status === 403) {
        throw new Error(`Access forbidden: ${errorData.detail || 'You do not have permission to update this resource'}`);
      }
      
      throw new Error(errorData.detail || 'Failed to update profile');
    }

    return response.json();
  },
};