import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";

import Checkbox from "../form/input/Checkbox";

// Define types
interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

interface RegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  agree_to_terms: boolean;
}

// Custom Input component with required prop support
interface CustomInputProps {
  type: string;
  id: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type,
  id,
  name,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
}) => {
  return (
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors"
    />
  );
};

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setConfirmPassword(e.target.value);
  };

  const handleCheckboxChange = (checked: boolean): void => {
    setIsChecked(checked);
  };

  const validateForm = (): boolean => {
    if (!isChecked) {
      setError("Please agree to the Terms and Conditions");
      return false;
    }

    if (!formData.first_name.trim() || !formData.last_name.trim() || 
        !formData.email.trim() || !formData.password || !confirmPassword) {
      setError("Please fill in all required fields");
      return false;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registrationData: RegistrationData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirm: confirmPassword,
        agree_to_terms: isChecked
      };

      const registerResponse = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const responseData = await registerResponse.json();

      if (registerResponse.ok) {
        setSuccess('Registration successful! Please check your email (including spam folder) for verification instructions.');
        
        // Clear form
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: ""
        });
        setConfirmPassword("");
        setIsChecked(false);
        
        // Auto-redirect after 5 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 5000);
        
      } else {
        // Handle specific API errors
        if (responseData.email) {
          throw new Error(`Email: ${responseData.email[0]}`);
        }
        if (responseData.password) {
          throw new Error(`Password: ${responseData.password[0]}`);
        }
        if (responseData.agree_to_terms) {
          throw new Error(`Terms: ${responseData.agree_to_terms[0]}`);
        }
        if (responseData.non_field_errors) {
          throw new Error(responseData.non_field_errors[0]);
        }
        throw new Error(responseData.detail || responseData.message || 'Registration failed. Please try again.');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = (): void => {
    setError("");
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to home
        </Link>
      </div>
      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Create Your Account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Join us today! Fill in your details to get started.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Success!</span>
              </div>
              <p className="mt-1">{success}</p>
              <p className="mt-2 text-green-600 dark:text-green-300">
                Redirecting to login page in 5 seconds...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Error!</span>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="sm:col-span-1">
                <Label htmlFor="first_name">
                  First Name<span className="text-error-500">*</span>
                </Label>
                <CustomInput
                  type="text"
                  id="first_name"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={loading}
                  required={true}
                />
              </div>
              
              <div className="sm:col-span-1">
                <Label htmlFor="last_name">
                  Last Name<span className="text-error-500">*</span>
                </Label>
                <CustomInput
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Enter your last name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={loading}
                  required={true}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">
                Email Address<span className="text-error-500">*</span>
              </Label>
              <CustomInput
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                required={true}
              />
            </div>

            <div>
              <Label htmlFor="password">
                Password<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <CustomInput
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password (min 8 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  required={true}
                />
                <button
                  type="button"
                  onClick={() => !loading && setShowPassword(!showPassword)}
                  disabled={loading}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {showPassword ? (
                    <EyeCloseIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="password_confirm">
                Confirm Password<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <CustomInput
                  type={showConfirmPassword ? "text" : "password"}
                  id="password_confirm"
                  name="password_confirm"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={loading}
                  required={true}
                />
                <button
                  type="button"
                  onClick={() => !loading && setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {showConfirmPassword ? (
                    <EyeCloseIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg dark:bg-gray-800/50">
              <Checkbox
                className="w-5 h-5 mt-0.5"
                checked={isChecked}
                onChange={handleCheckboxChange}
                disabled={loading}
              />
              <div className="text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    onClick={(e) => e.preventDefault()}
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    onClick={(e) => e.preventDefault()}
                  >
                    Privacy Policy
                  </Link>
                </p>
                {!isChecked && error.includes("Terms") && (
                  <p className="mt-1 text-sm text-error-500">{error}</p>
                )}
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}