import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import {  useNavigate } from "react-router-dom";
import { userService, UserData } from "../../services/userService";

interface UserDropdownProps {
  onShowSuccessMessage?: (message: string) => void;
}

export default function UserDropdown({ onShowSuccessMessage }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await userService.getProfile();
        setUserData(user);
        // Also update localStorage for backward compatibility
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to localStorage if API fails
        const localUser = localStorage.getItem('user');
        if (localUser) {
          setUserData(JSON.parse(localUser));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
    
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      closeDropdown();
      
      if (onShowSuccessMessage) {
        onShowSuccessMessage('Logout successful! Redirecting to sign in...');
      } else {
        showTemporarySuccessMessage('Logout successful! Redirecting to sign in...');
      }
      
      setTimeout(() => {
        navigate('/signin');
      }, 1500);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if API fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      closeDropdown();
      navigate('/signin');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const showTemporarySuccessMessage = (message: string) => {
    const messageEl = document.createElement('div');
    messageEl.className = 'fixed top-4 right-4 z-50 p-4 bg-green-500 text-white rounded-lg shadow-lg transform translate-x-0 opacity-100 transition-all duration-300';
    messageEl.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)';
      messageEl.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(messageEl)) {
          document.body.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
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

  // Get background color based on user name for consistent avatar colors
  const getAvatarColor = () => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600'
    ];
    const name = userData.first_name && userData.last_name 
      ? `${userData.first_name} ${userData.last_name}`
      : userData.username || 'User';
    const index = name.length % colors.length;
    return colors[index];
  };

  // Get user data
  const userName = userData.first_name && userData.last_name 
    ? `${userData.first_name} ${userData.last_name}`
    : userData.username || 'User';
  const userEmail = userData.email || 'user@morogoro-college.ac.tz';

  if (isLoading) {
    return (
      <div className="relative">
        <button
          disabled
          className="flex items-center text-gray-700 opacity-50 cursor-not-allowed dropdown-toggle dark:text-gray-400"
        >
          <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
          </span>
          <span className="block mr-1 font-medium text-theme-sm">
            Loading...
          </span>
          <svg
            className="stroke-gray-500 dark:stroke-gray-400 opacity-50"
            width="18"
            height="20"
            viewBox="0 0 18 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        disabled={isLoggingOut}
        className={`flex items-center text-gray-700 dropdown-toggle dark:text-gray-400 ${
          isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 border-2 border-white shadow-md dark:border-gray-800">
          <div className={`w-full h-full flex items-center justify-center ${getAvatarColor()} text-white font-bold text-lg rounded-full`}>
            {getUserInitials()}
          </div>
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {isLoggingOut ? 'Logging out...' : userName}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isLoggingOut ? 'opacity-50' : ''}`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen && !isLoggingOut}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        {/* Loading Overlay */}
        {isLoggingOut && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-dark/80 rounded-2xl flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Logging out...</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="w-12 h-12 overflow-hidden rounded-full border-2 border-white shadow-md dark:border-gray-700">
            <div className={`w-full h-full flex items-center justify-center ${getAvatarColor()} text-white font-bold text-base rounded-full`}>
              {getUserInitials()}
            </div>
          </div>
          <div>
            <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
              {userName}
            </span>
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
              {userEmail}
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z"
                  fill=""
                />
              </svg>
              Edit profile
            </DropdownItem>
          </li>
          {/* ... rest of the dropdown items remain the same ... */}
        </ul>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center gap-3 px-3 py-2 mt-3 font-medium rounded-lg group text-theme-sm transition-all ${
            isLoggingOut 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400'
          }`}
        >
          {isLoggingOut ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging out...
            </>
          ) : (
            <>
              <svg
                className="fill-gray-500 group-hover:fill-red-600 dark:fill-gray-400 dark:group-hover:fill-red-400"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
                  fill=""
                />
              </svg>
              Sign out
            </>
          )}
        </button>
      </Dropdown>
    </div>
  );
}