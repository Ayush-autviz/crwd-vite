import React, { useState, useRef } from "react";
import { Camera, Loader2, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import {
  emailRegistration,
  emailVerification,
  resendEmailVerificationCode,
  login,
} from "@/services/api/auth";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/store";

export default function NewClaimProfile() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    profileImage: null as string | null,
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const { setUser, setToken } = useAuthStore();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          profileImage: 'Please upload a valid image file.',
        }));
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          profileImage: 'Image size must be less than 5MB.',
        }));
        return;
      }

      // Clear any previous errors
      if (errors.profileImage) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.profileImage;
          return newErrors;
        });
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          profileImage: e.target?.result as string,
        }));
      };
      reader.onerror = () => {
        setErrors((prev) => ({
          ...prev,
          profileImage: 'Failed to read image file. Please try again.',
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password strength
    if (name === "password") {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!isPasswordStrong) {
      newErrors.password = "Password must meet all requirements";
    }

    if (!formData.termsAccepted) {
      newErrors.terms = "You must agree to the Terms of Use and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    // Create FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append("first_name", formData.firstName.trim());
    formDataToSend.append("last_name", formData.lastName.trim());
    formDataToSend.append("email", formData.email.trim());
    formDataToSend.append("password", formData.password);

    // Add profile picture if available
    if (formData.profileImage) {
      // Convert base64 to blob for FormData
      const base64Data = formData.profileImage.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });
      formDataToSend.append("profile_picture_file", blob, "profile.jpg");
    }

    console.log("Sending FormData:", Object.fromEntries(formDataToSend.entries()));
    emailRegistrationMutation.mutate(formDataToSend);
  };

  // Clear specific error when user starts typing
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const emailRegistrationMutation = useMutation({
    mutationFn: emailRegistration,
    onSuccess: (response) => {
      setShowOTPModal(true);
      if (response.message === "User already exists with this email") {
        handleResendEmailVerification();
      }
      console.log("email registered", response);
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Handle validation errors
      const errorData = error.response?.data;
      if (errorData?.errors) {
        // Check for profile picture error
        if (errorData.errors.profile_picture_file) {
          const profileError = Array.isArray(errorData.errors.profile_picture_file)
            ? errorData.errors.profile_picture_file[0]
            : errorData.errors.profile_picture_file;
          setErrors((prev) => ({
            ...prev,
            profileImage: profileError,
          }));
          setToastMessage(profileError);
        } else {
          // Handle other field errors
          const fieldErrors: Record<string, string> = {};
          Object.keys(errorData.errors).forEach((field) => {
            const fieldError = errorData.errors[field];
            fieldErrors[field] = Array.isArray(fieldError) ? fieldError[0] : fieldError;
          });
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
      }

      // Show toast with main message or first error
      const errorMessage = errorData?.message || error.message;
      const firstError = errorData?.errors
        ? Object.values(errorData.errors)[0]
        : null;
      const displayMessage = Array.isArray(firstError)
        ? firstError[0]
        : firstError || errorMessage;

      setToastMessage(displayMessage || "Registration failed");
      setShowToast(true);
    },
  });

  const emailVerificationMutation = useMutation({
    mutationFn: emailVerification,
    onSuccess: async (response) => {
      // setToastMessage("Email verified successfully!");
      // setShowToast(true);
      console.log("email verified", response);

      // Automatically login after successful email verification
      try {
        const loginResponse = await loginMutation.mutateAsync({
          email: formData.email.trim(),
          password: formData.password,
        });

        // Login mutation will handle navigation
        console.log("Auto-login successful:", loginResponse);
      } catch (loginError: any) {
        console.error("Auto-login error:", loginError);
        // If auto-login fails, navigate to login page
        setToastMessage("Email verified! Please login to continue.");
        setShowToast(true);
        navigate("/login");
      }
    },
    onError: (error: any) => {
      console.error("Email verification error:", error);
      setToastMessage(
        `Verification failed: ${error.response?.data?.message || error.message}`
      );
      setShowToast(true);
    },
  });

  // Login mutation for auto-login after verification
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      console.log("Login successful:", response);

      // Store user data and token in the store
      if (response.user) {
        setUser(response.user);
      }
      if (response.access_token) {
        setToken({
          access_token: response.access_token,
          refresh_token: response.refresh_token,
        });
      }

      // If last_login_at is null, navigate to nonprofit interests page (new user)
      if (response.user && !response.user.last_login_at) {
        navigate(`/non-profit-interests?redirectTo=${encodeURIComponent(redirectTo)}`, {
          state: { fromAuth: true },
          replace: true,
        });
      } else {
        // Navigate to redirectTo if available, otherwise home page for existing users
        navigate(redirectTo, { replace: true });
      }
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      // Error handling is done in emailVerificationMutation
    },
  });

  const resendEmailVerificationMutation = useMutation({
    mutationFn: resendEmailVerificationCode,
    onSuccess: (response) => {
      setToastMessage("Verification code sent successfully!");
      setShowToast(true);
      console.log("verification code resent", response);
    },
    onError: (error: any) => {
      console.error("Resend verification error:", error);
      setToastMessage(
        `Failed to resend code: ${error.response?.data?.message || error.message}`
      );
      setShowToast(true);
    },
  });

  const handleEmailVerification = () => {
    if (otp.length === 6) {
      emailVerificationMutation.mutate({
        email: formData.email,
        confirmation_code: otp,
      });
    } else {
      setToastMessage("Please enter a valid verification code");
      setShowToast(true);
    }
  };

  const handleResendEmailVerification = () => {
    if (formData.email.length > 0) {
      resendEmailVerificationMutation.mutate({
        email: formData.email,
      });
    } else {
      setToastMessage("Please enter a valid email address");
      setShowToast(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-8">

      <div className="w-full max-w-md bg-white rounded-xl p-6">
        {/* Progress Indicator - Step 2 */}
        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-6 sm:mb-8">
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-800 rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Finish your profile
          </h1>
          <p className="text-sm text-gray-600">
            So others can connect with you on CRWD
          </p>
        </div>

        {/* Profile Photo Section */}
        <div className="text-center mb-8">
          <button
            onClick={handleUploadClick}
            className="relative mx-auto"
          >
            {formData.profileImage ? (
              <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden mx-auto">
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center mx-auto">
                <Camera className="h-8 w-8 text-purple-600" />
              </div>
            )}
          </button>
          <p className="text-sm text-gray-900 mt-3">Add a Photo</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, firstName: e.target.value }));
                clearError("firstName");
              }}
              className={cn(
                "w-full h-12 border rounded-lg px-4 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 transition-colors",
                errors.firstName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-400 focus:ring-gray-400"
              )}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, lastName: e.target.value }));
                clearError("lastName");
              }}
              className={cn(
                "w-full h-12 border rounded-lg px-4 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 transition-colors",
                errors.lastName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-400 focus:ring-gray-400"
              )}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="janedoe@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                clearError("email");
              }}
              className={cn(
                "w-full h-12 border rounded-lg px-4 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 transition-colors",
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-400 focus:ring-gray-400"
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className={cn(
                  "h-12 border-gray-300 bg-gray-50 focus-visible:border-gray-400 focus-visible:ring-gray-400 pr-12",
                  errors.password &&
                  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                )}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2 space-y-2">
                <div className="text-xs text-gray-600">Password must contain:</div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      passwordStrength.hasMinLength
                        ? "text-green-600"
                        : "text-gray-400"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3 w-3",
                        passwordStrength.hasMinLength
                          ? "text-green-600"
                          : "text-gray-300"
                      )}
                    />
                    At least 8 characters
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      passwordStrength.hasUppercase
                        ? "text-green-600"
                        : "text-gray-400"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3 w-3",
                        passwordStrength.hasUppercase
                          ? "text-green-600"
                          : "text-gray-300"
                      )}
                    />
                    One uppercase letter
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      passwordStrength.hasLowercase
                        ? "text-green-600"
                        : "text-gray-400"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3 w-3",
                        passwordStrength.hasLowercase
                          ? "text-green-600"
                          : "text-gray-300"
                      )}
                    />
                    One lowercase letter
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      passwordStrength.hasNumber
                        ? "text-green-600"
                        : "text-gray-400"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3 w-3",
                        passwordStrength.hasNumber
                          ? "text-green-600"
                          : "text-gray-300"
                      )}
                    />
                    One number
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      passwordStrength.hasSpecialChar
                        ? "text-green-600"
                        : "text-gray-400"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3 w-3",
                        passwordStrength.hasSpecialChar
                          ? "text-green-600"
                          : "text-gray-300"
                      )}
                    />
                    One special character
                  </div>
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Terms and Privacy Checkbox */}
        <div className="flex items-start gap-3 mb-6">
          <input
            type="checkbox"
            id="terms"
            checked={formData.termsAccepted}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                termsAccepted: e.target.checked,
              }));
              clearError("terms");
            }}
            className={cn(
              "mt-1 w-5 h-5 rounded border-2 cursor-pointer",
              errors.terms
                ? "border-red-500"
                : "border-gray-300"
            )}
          />
          <label htmlFor="terms" className="text-sm text-gray-700 flex-1">
            By checking this box, you acknowledge and agree to CRWD's{" "}
            <a href="/terms" className="text-[#1600ff] hover:underline">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-[#1600ff] hover:underline">
              Privacy Policy
            </a>
            . <span className="text-red-500">*</span>
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-xs mb-4">{errors.terms}</p>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={emailRegistrationMutation.isPending}
          className="w-full h-12 bg-indigo-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 mb-6"
        >
          {emailRegistrationMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Continue <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to={`/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
              state={{ redirectParams: location.state?.redirectParams }}
              className="text-[#1600ff] hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4">
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Verify Your Email
              </h2>
              <p className="text-gray-600 text-sm">
                We've sent a verification code to{" "}
                <span className="font-medium">{formData.email}</span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Enter Verification Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full h-12 border border-gray-300 rounded-lg px-4 bg-white text-gray-900 text-lg text-center font-mono focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleEmailVerification}
                disabled={otp.length !== 6 || emailVerificationMutation.isPending}
                className="w-full h-12 bg-indigo-500 text-white font-medium rounded-lg"
              >
                {emailVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleResendEmailVerification}
                disabled={resendEmailVerificationMutation.isPending}
                className="w-full h-12 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg"
              >
                {resendEmailVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>

            {/* Close Modal */}
            <button
              className="w-full text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setShowOTPModal(false)}
            >
              Back to Registration
            </button>
          </div>
        </div>
      )}

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
}

