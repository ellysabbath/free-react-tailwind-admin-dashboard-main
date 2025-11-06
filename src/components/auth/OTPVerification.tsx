import { useState, FormEvent, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";

import Button from "../ui/button/Button";
import { authService } from "../../services/authService";

export default function OTPVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from location state
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      navigate('/reset-password');
    }
  }, [email, navigate]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input when a digit is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when last digit is entered
    if (value && index === 5) {
      const otpString = newOtp.join('');
      if (otpString.length === 6) {
        handleSubmit(otpString);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // Clear current input and stay there
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedNumbers = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (pastedNumbers.length === 6) {
      const newOtp = pastedNumbers.split('');
      setOtp(newOtp);
      
      // Focus the last input after paste
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 0);
      
      handleSubmit(pastedNumbers);
    }
  };

  const handleSubmit = async (otpString?: string) => {
    const finalOtp = otpString || otp.join('');
    
    if (finalOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authService.verifyOTP({ 
        email, 
        otp: finalOtp 
      });
      
      setSuccess("OTP verified successfully! Redirecting...");
      
      setTimeout(() => {
        navigate('/reset-password', { 
          state: { 
            email,
            verification_token: response.verification_token 
          } 
        });
      }, 1500);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "OTP verification failed. Please try again.");
      } else {
        setError("OTP verification failed. Please try again.");
      }
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/reset-password"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Verify OTP
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the 6-digit OTP sent to <span className="font-medium">{email}</span>
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
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error!</span>
              </div>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Enter OTP <span className="text-error-500">*</span>
                </Label>
                <div 
                  className="flex justify-between gap-2"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                      onFocus={(e) => e.target.select()}
                      disabled={loading}
                      className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-800 transition-colors"
                      required
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div>
                <Button
                  className="w-full"
                  size="sm"
                  disabled={loading || otp.join('').length !== 6}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              Didn't receive OTP? {""}
              <Link
                to="/reset-password"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Resend OTP
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}