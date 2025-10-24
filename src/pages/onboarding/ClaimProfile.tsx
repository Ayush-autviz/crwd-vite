import React, { useState, useRef } from "react";
import { Check, Camera, X, Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "antd";
import type { DatePickerProps } from "antd";
import { useMutation } from "@tanstack/react-query";
import { emailRegistration, emailVerification, resendEmailVerificationCode } from "@/services/api/auth";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function ClaimProfile() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    // dateOfBirth: null as Date | null,
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // if (!formData.dateOfBirth) {
    //   newErrors.dateOfBirth = "Date of birth is required";
    // }

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
    formDataToSend.append('first_name', formData.firstName.trim());
    formDataToSend.append('last_name', formData.lastName.trim());
    formDataToSend.append('email', formData.email.trim());
    formDataToSend.append('password', formData.password);
    // formDataToSend.append('date_of_birth', formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : '');

    // Add profile picture if available
    if (formData.profileImage) {
      // Convert base64 to blob for FormData
      const base64Data = formData.profileImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      formDataToSend.append('profile_picture_file', blob, 'profile.jpg');
    }

    console.log('Sending FormData:', Object.fromEntries(formDataToSend.entries()));
    emailRegistrationMutation.mutate(formDataToSend);
  };

  const onChange: DatePickerProps["onChange"] = (date) => {
    setFormData(prev => ({
      ...prev,
      dateOfBirth: date?.toDate() || null
    }));
    clearError('dateOfBirth');
  };

  // Clear specific error when user starts typing
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
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
      console.log('email registered', response);
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setToastMessage(`Registration failed: ${error.response?.data?.message || error.message}`);
      setShowToast(true);
    },
  });

  const emailVerificationMutation = useMutation({
    mutationFn: emailVerification,
    onSuccess: (response) => {
      setToastMessage("Email verified successfully!");
      setShowToast(true);
      console.log('email verified', response);
      navigate("/login");
    },
    onError: (error: any) => {
      console.error('Email verification error:', error);
      setToastMessage(`Verification failed: ${error.response?.data?.message || error.message}`);
      setShowToast(true);
    },
  });

  const resendEmailVerificationMutation = useMutation({
    mutationFn: resendEmailVerificationCode,
    onSuccess: (response) => {
      setToastMessage("Verification code sent successfully!");
      setShowToast(true);
      console.log('verification code resent', response);
    },
    onError: (error: any) => {
      console.error('Resend verification error:', error);
      setToastMessage(`Failed to resend code: ${error.response?.data?.message || error.message}`);
      setShowToast(true);
    },
  });

  const handleEmailVerification = () => {
    if (otp.length === 6) {
      emailVerificationMutation.mutate({
        email: formData.email,
        confirmation_code: otp
      });
    }
    else {
      setToastMessage("Please enter a valid verification code");
      setShowToast(true);
    }
  }

  const handleResendEmailVerification = () => {
    if (formData.email.length > 0) {
      resendEmailVerificationMutation.mutate({
        email: formData.email
      });
    }
    else {
      setToastMessage("Please enter a valid email address");
      setShowToast(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] [background-size:20px_20px]"></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center p-4  min-h-screen">
        <div className="w-full max-w-md">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="px-4 space-y-4">
              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-12 h-1 bg-black rounded-full"></div>
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Finish your profile
                </h1>
                <p className="text-gray-600 font-semibold text-sm">
                  So others can connect with you on CRWD
                </p>
              </div>

              {/* Add Photo Section */}
              <div className="text-center space-y-4">
                <div className="relative mx-auto">
                  {formData.profileImage ? (
                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden relative mx-auto">
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={handleRemovePhoto}
                        className="absolute top-1 right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleUploadClick}
                      className="w-20 h-20 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center mx-auto hover:border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      <Camera size={20} className="text-gray-400" />
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Add a Photo
                  </p>

                </div>
              </div>


              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, firstName: e.target.value }));
                      clearError('firstName');
                    }}
                    className={`w-full h-10 border rounded-lg px-3 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 transition-colors ${errors.firstName
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-gray-400 focus:ring-gray-400'
                      }`}
                  />

                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, lastName: e.target.value }));
                      clearError('lastName');
                    }}
                    className={`w-full h-10 border rounded-lg px-3 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 transition-colors ${errors.lastName
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-gray-400 focus:ring-gray-400'
                      }`}
                  />

                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="janedoe@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      clearError('email');
                    }}
                    className={`w-full h-10 border rounded-lg px-3 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 transition-colors ${errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-gray-400 focus:ring-gray-400'
                      }`}
                  />

                </div>

                {/* <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Date of birth <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    onChange={onChange}
                    className={`w-full h-10 border rounded-lg`}
                    placeholder="Select date"
                    style={errors.dateOfBirth ? { border: '1px solid red' } : { border: '1px solid #e0e0e0' }}
                  />
                
                </div> */}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      name="password"
                      className={cn(
                        "h-10 border-gray-300 focus-visible:border-gray-900 focus-visible:ring-gray-900/10 pr-10",
                        "transition-colors duration-200",
                        errors.password && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 hover:bg-gray-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2 space-y-2">
                      <div className="text-xs text-gray-600">Password must contain:</div>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div className={cn("flex items-center gap-2", passwordStrength.hasMinLength ? "text-green-600" : "text-gray-400")}>
                          <Check className={cn("h-3 w-3", passwordStrength.hasMinLength ? "text-green-600" : "text-gray-300")} />
                          At least 8 characters
                        </div>
                        <div className={cn("flex items-center gap-2", passwordStrength.hasUppercase ? "text-green-600" : "text-gray-400")}>
                          <Check className={cn("h-3 w-3", passwordStrength.hasUppercase ? "text-green-600" : "text-gray-300")} />
                          One uppercase letter
                        </div>
                        <div className={cn("flex items-center gap-2", passwordStrength.hasLowercase ? "text-green-600" : "text-gray-400")}>
                          <Check className={cn("h-3 w-3", passwordStrength.hasLowercase ? "text-green-600" : "text-gray-300")} />
                          One lowercase letter
                        </div>
                        <div className={cn("flex items-center gap-2", passwordStrength.hasNumber ? "text-green-600" : "text-gray-400")}>
                          <Check className={cn("h-3 w-3", passwordStrength.hasNumber ? "text-green-600" : "text-gray-300")} />
                          One number
                        </div>
                        <div className={cn("flex items-center gap-2", passwordStrength.hasSpecialChar ? "text-green-600" : "text-gray-400")}>
                          <Check className={cn("h-3 w-3", passwordStrength.hasSpecialChar ? "text-green-600" : "text-gray-300")} />
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

              {/* Terms checkbox */}
              <div className="flex items-center gap-3 p-4">
                <button
                  className={`w-5 h-5 border-2 rounded-full transition-all flex-shrink-0 mt-0.5 ${formData.termsAccepted
                      ? "border-gray-900 bg-gray-900"
                      : errors.terms
                        ? "border-red-500 bg-white"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, termsAccepted: !prev.termsAccepted }));
                    clearError('terms');
                  }}
                >
                  {formData.termsAccepted && <Check size={12} className="text-white m-auto" />}
                </button>

                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-5">
                    By checking this box, you acknowledge and agree to CRWD's
                    <span className="text-gray-900 font-medium">
                      {" "}
                      Terms of Use{" "}
                    </span>
                    and
                    <span className="text-gray-900 font-medium">
                      {" "}
                      Privacy Policy
                    </span>
                    . <span className="text-red-500">*</span>
                  </p>

                </div>
              </div>

              {/* Continue Button */}
              <button
                className={`w-full h-10 font-medium text-white rounded-lg transition-colors flex items-center justify-center ${emailRegistrationMutation.isPending
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                onClick={handleContinue}
                disabled={emailRegistrationMutation.isPending}
              >
                {emailRegistrationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Continue'
                )}
              </button>

              <div className="w-full max-w-md mx-auto px-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Already have an account?
                  </p>
                  <Link to="/login">
                    Sign In
                  </Link>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>


      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6 space-y-4">
                {/* Modal Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Verify Your Email
                  </h2>
                  <p className="text-gray-600 text-sm">
                    We've sent a verification code to <span className="font-medium">{formData.email}</span>
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
                    className="w-full h-12 border border-gray-300 rounded-lg px-4 bg-white text-gray-900 text-lg text-center font-mono focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    className={`w-full h-10 font-medium text-white rounded-lg transition-colors flex items-center justify-center ${emailVerificationMutation.isPending
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    onClick={handleEmailVerification}
                    disabled={otp.length !== 6 || emailVerificationMutation.isPending}
                  >
                    {emailVerificationMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>

                  <button
                    className={`w-full h-10 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center ${resendEmailVerificationMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    onClick={handleResendEmailVerification}
                    disabled={resendEmailVerificationMutation.isPending}
                  >
                    {resendEmailVerificationMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Code'
                    )}
                  </button>
                </div>

                {/* Close Modal */}
                <button
                  className="w-full text-gray-500 hover:text-gray-700 text-sm"
                  onClick={() => setShowOTPModal(false)}
                >
                  Back to Registration
                </button>
              </CardContent>
            </Card>
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
