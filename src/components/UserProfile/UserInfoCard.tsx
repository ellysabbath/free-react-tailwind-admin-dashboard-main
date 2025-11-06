import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { authService } from "../../services/authService";

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
  profile?: {
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
  };
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
const generateAcademicYears = () => {
  const years = [];
  for (let year = 1990; year <= 2061; year++) {
    years.push(`${year}/${year + 1}`);
  }
  return years;
};

const ACADEMIC_YEARS = generateAcademicYears();

// Define the form data interface
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

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
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

  // Dropdown states
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showAcademicYearDropdown, setShowAcademicYearDropdown] = useState(false);

  // Check if user is a student (for GPA editing)
  const isStudent = userData.role === 'student' || (!userData.is_staff && !userData.is_admin);

  // Fetch user data from API
  const fetchUserData = async () => {
    try {
      const user = await authService.getProfile();
      setUserData(user);
      
      // Update form data with API response
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
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to localStorage if API fails
      const localUser = authService.getCurrentUser();
      if (localUser) {
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
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Create FormData for the update
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
      
      // Only allow GPA update if user is not a student
      if (!isStudent && editFormData.gpa) {
        formData.append('profile.gpa', editFormData.gpa);
      }

      console.log('📤 Updating user profile...');
      
      // Use authService to update profile
      const result = await authService.updateProfile(formData);
      console.log('✅ Update successful:', result);
      
      // Update local state with the returned user data
      setUserData(result.user);
      
      closeModal();
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Fixed: Properly typed handleInputChange function
  const handleInputChange = (field: keyof EditFormData, value: string | boolean) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            {/* Basic Information */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.first_name || 'Not set'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.last_name || 'Not set'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.email || 'Not set'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.profile?.phone || 'Not set'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.profile?.bio || 'Not set'}
              </p>
            </div>

            {/* Location Information */}
            {userData.profile?.country && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Country
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.profile.country}
                </p>
              </div>
            )}

            {userData.profile?.region && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Region
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.profile.region}
                </p>
              </div>
            )}

            {userData.profile?.district && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  District
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.profile.district}
                </p>
              </div>
            )}

            {userData.profile?.city_state && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  City/State
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.profile.city_state}
                </p>
              </div>
            )}

            {userData.profile?.location && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Location
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.profile.location}
                </p>
              </div>
            )}

            {/* Academic Information */}
            {userData.profile?.registration_status !== undefined && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Registration Status
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.profile.registration_status ? 'Active' : 'Inactive'}
                </p>
              </div>
            )}

            {userData.profile?.academic_year && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Academic Year
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.profile.academic_year}
                </p>
              </div>
            )}

            {userData.profile?.gpa && (
              <div>
              
              </div>
            )}

            {/* Role Information */}
            {userData.role && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Role
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                </p>
              </div>
            )}

            {/* Account Status */}
            {userData.is_active !== undefined && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Account Status
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl max-h-[85vh] bg-white p-4 dark:bg-gray-900 lg:p-11">
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
              {/* Location Information Section */}
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Location Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  {/* Country Dropdown */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Country</Label>
                    <div className="relative">
                      <div 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer dark:bg-gray-800 dark:border-gray-600"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      >
                        {editFormData.country || "Select country"}
                      </div>
                      {showCountryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-600">
                          {AFRICAN_COUNTRIES.map((country) => (
                            <div
                              key={country}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer dark:bg-gray-800 dark:border-gray-600"
                        onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                      >
                        {editFormData.region || "Select region"}
                      </div>
                      {showRegionDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-600">
                          {TANZANIA_REGIONS.map((region) => (
                            <div
                              key={region}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
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
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Academic Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  {/* Registration Status */}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer dark:bg-gray-800 dark:border-gray-600"
                        onClick={() => setShowAcademicYearDropdown(!showAcademicYearDropdown)}
                      >
                        {editFormData.academic_year || "Select academic year"}
                      </div>
                      {showAcademicYearDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-600">
                          {ACADEMIC_YEARS.map((year) => (
                            <div
                              key={year}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
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

                  {/* GPA Field (Read-only for students) */}
              
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving}
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
    </div>
  );
}