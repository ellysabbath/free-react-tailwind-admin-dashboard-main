// types/auth.ts

// Authentication types
export interface PasswordResetRequestData {
  email: string;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
}

export interface PasswordResetData {
  email: string;
  new_password: string;
  confirm_password: string;
  verification_token: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  verification_token?: string;
}

// User Profile types
export interface UserProfile {
  id?: number;
  bio?: string;
  phone?: string;
  location?: string;
  profile_picture?: string;
  country?: string;
  city_state?: string;
  username?: string;
  region? :string;
  district? :string;
  registration_status? :boolean;
  academic_year?:string;
  gpa? :string;

}

export interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  profile: UserProfile;
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
    profile_picture?: string;
  };
}

// Login/Signup types
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  username?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: UserData;
}

// Token types
export interface TokenRefreshData {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}