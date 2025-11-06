// components/UserMetaCard.tsx
import { useState, useEffect, useCallback } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  bio?: string;
  phone?: string;
  location?: string;
  profile_picture?: string;
  country?: string;
  city_state?: string;
  region?: string;
  district?: string;
  registration_status?: boolean;
  academic_year?: string;
  gpa?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserData {
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
  profile?: UserProfile;
}

interface UserMetaCardProps {
  onShowSuccessMessage?: (message: string) => void;
  onShowErrorMessage?: (message: string) => void;
}

// African countries list
const AFRICAN_COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros",
  "Democratic Republic of the Congo", "Djibouti", "Egypt", "Equatorial Guinea",
  "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea",
  "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya",
  "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco",
  "Mozambique", "Namibia", "Niger", "Nigeria", "Republic of the Congo",
  "Rwanda", "São Tomé and Príncipe", "Senegal", "Seychelles", "Sierra Leone",
  "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo",
  "Tunisia", "Uganda", "Zambia", "Zimbabwe"
];

// Tanzania regions
const TANZANIA_REGIONS = [
  "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera",
  "Katavi", "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara",
  "Mbeya", "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North",
  "Pemba South", "Pwani", "Rukwa", "Ruvuma", "Shinyanga", "Simiyu",
  "Singida", "Songwe", "Tabora", "Tanga", "Zanzibar Central/South",
  "Zanzibar North", "Zanzibar Urban/West"
];

// Generate academic years from 1990 to 2061 in format "2024/2025"
const generateAcademicYears = (): string[] => {
  const years: string[] = [];
  for (let year = 1990; year <= 2061; year++) {
    years.push(`${year}/${year + 1}`);
  }
  return years;
};

const ACADEMIC_YEARS = generateAcademicYears();

interface EditFormData {
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  country: string;
  region: string;
  district: string;
  city_state: string;
  location: string;
  registration_status: boolean;
  academic_year: string;
  gpa: string;
}

export default function UserMetaCard({ onShowSuccessMessage, onShowErrorMessage }: UserMetaCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    country: "",
    region: "",
    district: "",
    city_state: "",
    location: "",
    registration_status: true,
    academic_year: "",
    gpa: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Dropdown states
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showAcademicYearDropdown, setShowAcademicYearDropdown] = useState(false);

  // Debug function
  const debugLocalStorage = useCallback((): string => {
    const userId = authService.getCurrentUserId();
    const userData = authService.getCurrentUser();
    const accessToken = localStorage.getItem('access_token');
    
    let debugMessage = `🔍 LOCALSTORAGE DEBUG:\n`;
    debugMessage += `User ID: ${userId || '❌ Not found'}\n`;
    debugMessage += `Access Token: ${accessToken ? '✅ Present' : '❌ Missing'}\n`;
    debugMessage += `Stored User: ${userData ? '✅ Present' : '❌ Missing'}\n`;
    
    if (userData) {
      debugMessage += `Username: ${userData.username || 'N/A'}\n`;
      debugMessage += `Email: ${userData.email || 'N/A'}\n`;
      debugMessage += `Name: ${userData.first_name || ''} ${userData.last_name || ''}\n`;
      debugMessage += `Profile Data: ${userData.profile ? '✅ Present' : '❌ Missing'}\n`;
    }
    
    setDebugInfo(debugMessage);
    console.log(debugMessage);
    
    return debugMessage;
  }, []);

  // Fetch user data
  const fetchUserData = useCallback(async (): Promise<void> => {
    try {
      // Check if user is authenticated first
      if (!authService.isAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        onShowErrorMessage?.('Please log in to view your profile');
        navigate('/signin');
        return;
      }

      console.log('🔄 Fetching user data for profile card...');
      const user = await authService.getProfile();
      console.log('✅ User data received:', user);
      
      // Update state with fetched data
      setUserData(user);
      setEditFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.profile?.phone || '',
        bio: user.profile?.bio || '',
        country: user.profile?.country || '',
        region: user.profile?.region || '',
        district: user.profile?.district || '',
        city_state: user.profile?.city_state || '',
        location: user.profile?.location || '',
        registration_status: user.profile?.registration_status ?? true,
        academic_year: user.profile?.academic_year || '',
        gpa: user.profile?.gpa || ''
      });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile data';
      console.error('❌ Error fetching user data:', error);
      onShowErrorMessage?.(errorMessage);
      
      // Fallback to localStorage if API fails
      const localUser = authService.getCurrentUser();
      if (localUser) {
        console.log('🔄 Using stored user data as fallback');
        setUserData(localUser);
        setEditFormData({
          first_name: localUser.first_name || '',
          last_name: localUser.last_name || '',
          phone: localUser.profile?.phone || '',
          bio: localUser.profile?.bio || '',
          country: localUser.profile?.country || '',
          region: localUser.profile?.region || '',
          district: localUser.profile?.district || '',
          city_state: localUser.profile?.city_state || '',
          location: localUser.profile?.location || '',
          registration_status: localUser.profile?.registration_status ?? true,
          academic_year: localUser.profile?.academic_year || '',
          gpa: localUser.profile?.gpa || ''
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, onShowErrorMessage]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    console.log('💾 Saving profile...');
    
    try {
      // Create FormData to handle both regular data and file upload
      const formData = new FormData();
      
      // Add required fields
      formData.append('first_name', editFormData.first_name);
      formData.append('last_name', editFormData.last_name);
      
      // Add profile fields
      if (editFormData.phone) formData.append('profile.phone', editFormData.phone);
      if (editFormData.bio) formData.append('profile.bio', editFormData.bio);
      if (editFormData.country) formData.append('profile.country', editFormData.country);
      if (editFormData.region) formData.append('profile.region', editFormData.region);
      if (editFormData.district) formData.append('profile.district', editFormData.district);
      if (editFormData.city_state) formData.append('profile.city_state', editFormData.city_state);
      if (editFormData.location) formData.append('profile.location', editFormData.location);
      formData.append('profile.registration_status', editFormData.registration_status.toString());
      if (editFormData.academic_year) formData.append('profile.academic_year', editFormData.academic_year);
      if (editFormData.gpa) formData.append('profile.gpa', editFormData.gpa);
      
      // Add image if selected
      if (selectedFile) {
        formData.append('profile.profile_picture', selectedFile);
      }

      console.log('📤 Sending FormData with profile update...');
      
      // Use authService to update profile with FormData
      const result = await authService.updateProfile(formData);
      console.log('✅ Update successful:', result);
      
      // Update local state with the returned user data
      setUserData(result.user);
      setSelectedFile(null);
      
      closeModal();
      
      onShowSuccessMessage?.(result.message || 'Profile updated successfully!');
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      console.error('❌ Error updating profile:', error);
      onShowErrorMessage?.(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof EditFormData, value: string | boolean): void => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        onShowErrorMessage?.('Please select an image file (JPEG, PNG, JPG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        onShowErrorMessage?.('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadImage = async (): Promise<void> => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      console.log('📤 Uploading image file only:', selectedFile.name);
      
      // Use the dedicated image upload method from authService
      const result = await authService.uploadProfilePicture(selectedFile);
      console.log('✅ Image upload successful:', result);
      
      // Update local state with the returned user data
      setUserData(result.user);
      setSelectedFile(null);

      onShowSuccessMessage?.('Profile picture updated successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      console.error('❌ Error uploading image:', error);
      onShowErrorMessage?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (): Promise<void> => {
    try {
      // Create FormData with empty profile_picture to remove it
      const formData = new FormData();
      formData.append('first_name', editFormData.first_name);
      formData.append('last_name', editFormData.last_name);
      formData.append('profile.profile_picture', ''); // Empty string to remove

      const result = await authService.updateProfile(formData);
      
      // Update state
      setUserData(result.user);
      setSelectedFile(null);
      
      onShowSuccessMessage?.('Profile picture removed successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove profile picture';
      console.error('❌ Error removing profile picture:', error);
      onShowErrorMessage?.(errorMessage);
    }
  };

  // Helper functions to access nested profile data
  const getUserFullName = (): string => {
    if (userData.first_name && userData.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    return userData.first_name || userData.last_name || userData.full_name || userData.username || 'User';
  };

  // Get user initials for avatar
  const getUserInitials = (): string => {
    const firstName = userData.first_name || '';
    const lastName = userData.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (userData.username) {
      return userData.username.charAt(0).toUpperCase();
    } else {
      return 'U';
    }
  };

  // Get background color based on user initials for consistent avatar colors
  const getAvatarColor = (): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const name = getUserFullName();
    const index = name.length % colors.length;
    return colors[index];
  };

  const getUserLocation = (): string => {
    const locationParts: string[] = [];
    if (userData.profile?.district) locationParts.push(userData.profile.district);
    if (userData.profile?.region) locationParts.push(userData.profile.region);
    if (userData.profile?.country) locationParts.push(userData.profile.country);
    if (userData.profile?.city_state) locationParts.push(userData.profile.city_state);
    if (userData.profile?.location) locationParts.push(userData.profile.location);
    
    return locationParts.join(', ') || 'Location not set';
  };

  const getUserBio = (): string => {
    return userData.profile?.bio || 'No bio provided';
  };

  const getUserRole = (): string => {
    return userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'User';
  };

  // Debug handlers
  const handleDebugClick = (): void => {
    debugLocalStorage();
  };

  const handleRetryProfile = (): void => {
    // Reset loading state and refetch data
    setIsLoading(true);
    fetchUserData();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </div>
            <div className="order-3 xl:order-2 text-center xl:text-left">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 mx-auto xl:mx-0"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto xl:mx-0"></div>
              <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2 mx-auto xl:mx-0"></div>
            </div>
          </div>
          <div className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-400 dark:border-gray-700 dark:bg-gray-800 lg:inline-flex lg:w-auto">
            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"/>
            </svg>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* User Profile Card */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center">
              <div className={`w-full h-full flex items-center justify-center ${getAvatarColor()} text-white text-xl font-bold rounded-full`}>
                {getUserInitials()}
              </div>
            </div>
            <div className="order-3 xl:order-2 text-center xl:text-left">
              <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90 xl:text-left">
                {getUserFullName()}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {getUserRole()}
                </span>
                {getUserLocation() && (
                  <>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getUserLocation()}
                    </p>
                  </>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {getUserBio()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openModal}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"/>
              </svg>
              Edit Profile
            </button>
            
            {/* Debug button */}
            <button
              onClick={handleDebugClick}
              className="flex items-center justify-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-3 py-3 text-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              title="Debug localStorage"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Debug panel */}
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded text-xs dark:bg-gray-800 dark:border-gray-600">
            <div className="font-bold mb-1">Debug Info:</div>
            <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
            <div className="mt-2 flex gap-2">
              <button onClick={handleDebugClick} className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                Refresh Debug
              </button>
              <button onClick={() => console.log(authService.debugAuthStatus())} className="px-2 py-1 bg-purple-500 text-white text-xs rounded">
                Auth Status
              </button>
              <button onClick={handleRetryProfile} className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                Retry Profile
              </button>
              <button onClick={() => setDebugInfo('')} className="px-2 py-1 bg-gray-500 text-white text-xs rounded">
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              {/* Profile Picture Section */}
              <div className="mb-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Profile Avatar
                </h5>
                
                <div className="flex flex-col items-center gap-6 lg:flex-row">
                  <div className="relative">
                    <div className="w-24 h-24 border border-gray-200 rounded-full dark:border-gray-700 flex items-center justify-center">
                      <div className={`w-full h-full flex items-center justify-center ${getAvatarColor()} text-white text-2xl font-bold rounded-full`}>
                        {getUserInitials()}
                      </div>
                    </div>
                    {(isUploading || isSaving) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <label className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload Photo
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isUploading || isSaving}
                        />
                      </label>
                      
                      <button
                        type="button"
                        onClick={handleUploadImage}
                        disabled={!selectedFile || isUploading || isSaving}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:border-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={!userData.profile?.profile_picture || isUploading || isSaving}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 dark:bg-gray-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove Photo
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG or WebP. Max size 5MB.
                    </p>
                    {selectedFile && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name *</Label>
                    <Input 
                      type="text" 
                      value={editFormData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name *</Label>
                    <Input 
                      type="text" 
                      value={editFormData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone Number</Label>
                    <Input 
                      type="tel" 
                      value={editFormData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input 
                      type="text" 
                      value={editFormData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  {/* Country Dropdown */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Country</Label>
                    <div className="relative">
                      <div 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer dark:bg-green-800 dark:border-gray-600"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      >
                        {editFormData.country || "Select country"}
                      </div>
                      {showCountryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-green-800 dark:border-gray-600">
                          {AFRICAN_COUNTRIES.map((country) => (
                            <div
                              key={country}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-green-400"
                              onClick={() => {
                                handleInputChange('country', country);
                                setShowCountryDropdown(false);
                              }}
                            >
                              {country}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Region Dropdown */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Region</Label>
                    <div className="relative">
                      <div 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer dark:bg-green-800 dark:border-gray-600"
                        onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                      >
                        {editFormData.region || "Select region"}
                      </div>
                      {showRegionDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-green-800 dark:border-gray-600">
                          {TANZANIA_REGIONS.map((region) => (
                            <div
                              key={region}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-green-400"
                              onClick={() => {
                                handleInputChange('region', region);
                                setShowRegionDropdown(false);
                              }}
                            >
                              {region}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>District</Label>
                    <Input 
                      type="text" 
                      value={editFormData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="Enter your district"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>City/State</Label>
                    <Input 
                      type="text" 
                      value={editFormData.city_state}
                      onChange={(e) => handleInputChange('city_state', e.target.value)}
                      placeholder="Enter your city or state"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Location</Label>
                    <Input 
                      type="text" 
                      value={editFormData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter your full address"
                    />
                  </div>

                  {/* Academic Information */}
                  <div className="col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="registration_status"
                        checked={editFormData.registration_status}
                        onChange={(e) => handleInputChange('registration_status', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <Label htmlFor="registration_status" className="cursor-pointer">
                        Registration Status (Active)
                      </Label>
                    </div>
                  </div>

                  {/* Academic Year Dropdown */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Academic Year</Label>
                    <div className="relative">
                      <div 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer dark:bg-green-800 dark:border-gray-600"
                        onClick={() => setShowAcademicYearDropdown(!showAcademicYearDropdown)}
                      >
                        {editFormData.academic_year || "Select academic year"}
                      </div>
                      {showAcademicYearDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-green-800 dark:border-gray-600">
                          {ACADEMIC_YEARS.map((year) => (
                            <div
                              key={year}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-green-400"
                              onClick={() => {
                                handleInputChange('academic_year', year);
                                setShowAcademicYearDropdown(false);
                              }}
                            >
                              {year}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal}
                disabled={isSaving || isUploading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving || isUploading}
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}