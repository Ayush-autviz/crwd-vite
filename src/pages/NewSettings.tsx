"use client"

import React, { useState, useEffect, useRef } from 'react'
import ProfileNavbar from "../components/profile/ProfileNavbar"
import {
  CircleHelp,
  CreditCard,
  FileText,
  Lock,
  Mail,
  Heart,
  ChevronDown,
  Eye,
  EyeOff,
  User,
  Check,
} from "lucide-react"
import { useAuthStore } from '@/stores/store'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserProfileById } from "@/services/api/social"
import { updateProfile, changePassword, updateEmail, updateEmailVerification } from "@/services/api/auth"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Toast } from "@/components/ui/toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import RequestNonprofitModal from '@/components/newsearch/RequestNonprofitModal';
import { PaymentMethodsSheet } from '@/components/profile/PaymentMethodsSheet';
import { DiscardSheet } from '@/components/ui/DiscardSheet';


export default function NewSettings() {
  const navigate = useNavigate()
  const { user: currentUser, setUser } = useAuthStore()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showOTPDialog, setShowOTPDialog] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (showExitConfirmation) {
        setShowExitConfirmation(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showExitConfirmation]);

  const passwordModalRef = useRef<HTMLDivElement>(null);
  const emailModalRef = useRef<HTMLDivElement>(null);
  const otpModalRef = useRef<HTMLDivElement>(null);

  const handleFocus = (field: string) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocusedField(field);
    const target = e.target;
    // Delay to allow keyboard animation and sheet adjustment
    setTimeout(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  };

  useEffect(() => {
    const isAnyModalOpen = showPasswordDialog || showEmailDialog || showOTPDialog;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (showPasswordDialog && passwordModalRef.current && !passwordModalRef.current.contains(event.target as Node)) {
        setShowPasswordDialog(false);
      }
      if (showEmailDialog && emailModalRef.current && !emailModalRef.current.contains(event.target as Node)) {
        setShowEmailDialog(false);
      }
      if (showOTPDialog && otpModalRef.current && !otpModalRef.current.contains(event.target as Node)) {
        setShowOTPDialog(false);
      }
    };

    if (isAnyModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPasswordDialog, showEmailDialog, showOTPDialog]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPasswordDialog(false);
        setShowEmailDialog(false);
        setShowOTPDialog(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    location: '',
    bio: '',
    profile_picture_file: ''
  })
  const [originalData, setOriginalData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    location: '',
    bio: '',
    profile_picture_file: ''
  })
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Email form state
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    confirmEmail: "",
  })
  const [otp, setOtp] = useState("")
  const [emailErrors, setEmailErrors] = useState({
    newEmail: "",
    confirmEmail: "",
  })

  // Fetch profile data
  const { data: profileData } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: () => getUserProfileById(currentUser?.id?.toString() || ''),
    enabled: !!currentUser?.id,
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      // if (response?.user?.profile_picture && currentUser) {
      //   setUser({ ...currentUser, profile_picture: response.user.profile_picture })
      // }
      setUser(response.user)
      queryClient.invalidateQueries({ queryKey: ['userProfile', currentUser?.id] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      // setShowToast(true)
      // setToastMessage('Profile updated successfully!')
      setIsEditMode(false)
      setOriginalData(formData)
      setSelectedImageFile(null)
      setSelectedImageUrl(null)
    },
    onError: (error: any) => {
      // Check for image validation error
      const errorMessage = error?.response?.data?.message || error?.message || '';
      if (errorMessage.includes('profile_picture_file') || errorMessage.includes('invalid_image') || errorMessage.includes('corrupted image')) {
        setShowToast(true)
        setToastMessage('Please upload a valid image file. The file may be corrupted or not a valid image format.')
      } else {
        setShowToast(true)
        setToastMessage(errorMessage || 'Failed to update profile. Please try again.')
      }
    },
  })

  useEffect(() => {
    if (profileData) {
      const data = {
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        username: profileData.username || '',
        email: currentUser?.email || profileData.email || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
        profile_picture_file: profileData.profile_picture || ''
      }
      setFormData(data)
      setOriginalData(data)
    }
  }, [profileData, currentUser])

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setShowToast(true)
      setToastMessage('Password changed successfully!')
      setShowPasswordDialog(false)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "" })
    },
    onError: (error: any) => {
      setShowToast(true)
      setToastMessage(error.response?.data?.message || 'Failed to change password')
    },
  })

  // Update email mutation
  const updateEmailMutation = useMutation({
    mutationFn: updateEmail,
    onSuccess: () => {
      setShowToast(true)
      setToastMessage('Verification code sent to your new email!')
      setShowOTPDialog(true)
    },
    onError: (error: any) => {
      setShowToast(true)
      setToastMessage(error.response?.data?.message || 'Failed to update email')
    },
  })

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: updateEmailVerification,
    onSuccess: () => {
      setShowToast(true)
      setToastMessage('Email updated successfully!')
      setShowEmailDialog(false)
      setShowOTPDialog(false)
      setEmailForm({ newEmail: "", confirmEmail: "" })
      setEmailErrors({ newEmail: "", confirmEmail: "" })
      setOtp("")
    },
    onError: (error: any) => {
      setShowToast(true)
      setToastMessage(error.response?.data?.message || 'Failed to verify email')
    },
  })


  const handleEdit = () => {
    setIsEditMode(true)
    // Hook handles history push
  }

  // Handle browser back and page refresh
  useUnsavedChanges(isEditMode, setShowExitConfirmation, false);

  const handleBackClick = () => {
    if (isEditMode) {
      setShowExitConfirmation(true)
    } else {
      navigate(-1)
    }
  }

  const confirmExit = () => {
    setIsEditMode(false)
    setShowExitConfirmation(false)
    // Use -2 because we pushed a dummy state manually during handleEdit
    navigate(-2)
  }

  const handleCancel = () => {
    setFormData(originalData)
    setSelectedImageFile(null)
    setSelectedImageUrl(null)
    setIsEditMode(false)
  }

  const handleSave = async () => {
    // Validation
    if (!formData.first_name.trim()) {
      setShowToast(true)
      setToastMessage('First name cannot be empty')
      return
    }
    if (!formData.last_name.trim()) {
      setShowToast(true)
      setToastMessage('Last name cannot be empty')
      return
    }
    if (formData.username.trim() && !formData.username.trim().match(/^[a-zA-Z0-9_]+$/)) {
      setShowToast(true)
      setToastMessage('Username should only contain letters, numbers, and underscores')
      return
    }
    if (formData.bio.length > 160) {
      setShowToast(true)
      setToastMessage('Bio cannot exceed 160 characters')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      setShowToast(true)
      setToastMessage('Please enter a valid email address')
      return
    }

    const updateData: any = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      username: formData.username.trim(),
      location: formData.location.trim(),
      bio: formData.bio.trim(),
    }

    // If image was selected, add it to FormData
    if (selectedImageFile) {
      const formDataToSend = new FormData()
      Object.keys(updateData).forEach(key => {
        formDataToSend.append(key, updateData[key])
      })
      formDataToSend.append('profile_picture_file', selectedImageFile)
      updateProfileMutation.mutate(formDataToSend)
    } else {
      updateProfileMutation.mutate(updateData)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setShowToast(true)
        setToastMessage('Please select a valid image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setShowToast(true)
        setToastMessage('Image size should be less than 5MB')
        return
      }

      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        setSelectedImageUrl(url)
      }
      reader.readAsDataURL(file)
    }
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters long"
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/[0-9]/.test(password)) return "Password must contain at least one number"
    return ""
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors = {
      currentPassword: !passwordForm.currentPassword ? "Current password is required" : "",
      newPassword: validatePassword(passwordForm.newPassword),
      confirmPassword: passwordForm.newPassword !== passwordForm.confirmPassword ? "Passwords do not match" : "",
    }

    setPasswordErrors(errors)

    if (!errors.currentPassword && !errors.newPassword && !errors.confirmPassword) {
      changePasswordMutation.mutate({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      })
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return "Email is required"
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return ""
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors = {
      newEmail: validateEmail(emailForm.newEmail),
      confirmEmail: emailForm.newEmail !== emailForm.confirmEmail ? "Emails do not match" : "",
    }

    setEmailErrors(errors)

    if (!errors.newEmail && !errors.confirmEmail) {
      updateEmailMutation.mutate({
        new_email: emailForm.newEmail,
      })
    }
  }

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyEmailMutation.mutate({
      new_email: emailForm.newEmail,
      otp: otp,
    })
  }



  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  const faqData = [
    {
      question: "How does the donation box capacity work?",
      answer: "The donation box capacity determines how many causes can be supported with your current donation amount. As you increase your donation, more causes can be supported simultaneously."
    },
    {
      question: "What are crwd's fees?",
      answer: "CRWD charges a small processing fee on donations to cover payment processing and platform maintenance. The exact fee percentage is displayed before you confirm your donation."
    },
    {
      question: "How are donations split?",
      answer: "Donations are split equally among all the causes you've selected in your donation box. You can adjust the distribution or remove causes at any time."
    },
    {
      question: "What is a Collective?",
      answer: "A Collective is a group of users who come together to support specific causes or nonprofits. You can join existing Collectives or create your own to amplify your impact."
    },
    {
      question: "Are donations tax-deductible?",
      answer: "Yes, donations made through CRWD to verified 501(c)(3) nonprofit organizations are tax-deductible. You'll receive a receipt for your records."
    },
    {
      question: "Can I cancel a recurring donation?",
      answer: "Yes, you can cancel or modify your recurring donations at any time from the Payment & Receipts section in your settings."
    }
  ]

  if (!currentUser?.id) {
    return null
  }

  return (
    <div className="h-full flex flex-col">
      <ProfileNavbar
        title="Settings"
        onBackClick={handleBackClick}
        showDesktopBackButton={true}
      />

      <div className="flex-1 w-full bg-white overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Account Component */}
          <div className="mb-4 md:mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            {/* Header */}
            <div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <User className="h-4 h-4 md:h-6 md:w-6 text-blue-600" />
                <h2 className="text-sm xs:text-base md:text-lg font-bold text-gray-900">Account</h2>
              </div>
              {!isEditMode && (
                <button
                  onClick={handleEdit}
                  className="text-sm xs:text-base md:text-lg font-medium text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col items-center py-4 md:py-5">
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={!isEditMode}
                />
                <button
                  onClick={() => isEditMode && fileInputRef.current?.click()}
                  disabled={!isEditMode}
                  className={`${isEditMode ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
                >
                  {selectedImageUrl || formData.profile_picture_file ? (
                    <Avatar className="w-20 h-20 md:w-24 md:h-24">
                      <AvatarImage src={selectedImageUrl || formData.profile_picture_file} />
                      <AvatarFallback style={{ backgroundColor: currentUser?.color }}>
                        <User className="h-10 w-10 md:h-12 md:w-12 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div style={{ backgroundColor: currentUser?.color }} className="w-20 h-20 md:w-24 md:h-24 rounded-full text-white text-2xl font-bold flex items-center justify-center">
                      {currentUser?.first_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                {/* {isEditMode && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  </button>
                )} */}
              </div>
              {isEditMode && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] xs:text-xs md:text-sm text-gray-500 mt-1.5 md:mt-2 hover:text-gray-700 text-center px-2"
                >
                  Click to upload profile image
                </button>
              )}
            </div>

            {/* Input Fields */}
            <div className="px-3 md:px-5 pb-6 md:pb-8 space-y-4 md:space-y-5">
              {/* First Name */}
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs xs:text-sm md:text-base font-bold text-gray-900">First Name</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  onFocus={() => setFocusedField('first_name')}
                  onBlur={() => setFocusedField(null)}
                  disabled={!isEditMode}
                  placeholder={focusedField === 'first_name' ? '' : "First Name"}
                  className={`bg-gray-100 border-0 text-sm xs:text-base md:text-lg ${isEditMode ? 'text-black' : ''}`}
                />
              </div>

              {/* Last Name */}
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs xs:text-sm md:text-base font-bold text-gray-900">Last Name</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  onFocus={() => setFocusedField('last_name')}
                  onBlur={() => setFocusedField(null)}
                  disabled={!isEditMode}
                  placeholder={focusedField === 'last_name' ? '' : "Last Name"}
                  className={`bg-gray-100 border-0 text-sm xs:text-base md:text-lg ${isEditMode ? 'text-black' : ''}`}
                />
              </div>

              {/* Username */}
              {/* <div>
                <Label className="mb-1.5 md:mb-2 text-xs md:text-sm font-bold text-gray-900">Username</Label>
                <Input
                  value={formData.username}
                  disabled={true}
                  placeholder="Username"
                  className="bg-gray-100 border-0 text-sm md:text-base opacity-60 cursor-not-allowed"
                />
              </div> */}

              {/* Email */}
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs xs:text-sm md:text-base font-bold text-gray-900">Email</Label>
                <Input
                  value={formData.email}
                  disabled={true}
                  placeholder="Email"
                  className={`bg-gray-100 border-0 text-sm xs:text-base md:text-lg opacity-60 cursor-not-allowed ${isEditMode ? 'text-black' : ''}`}
                />
              </div>

              {/* Location */}
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs xs:text-sm md:text-base font-bold text-gray-900">Location</Label>
                <div className="relative">
                  {/* <MapPin className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500" /> */}
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    onFocus={() => setFocusedField('location')}
                    onBlur={() => setFocusedField(null)}
                    disabled={!isEditMode}
                    placeholder={focusedField === 'location' ? '' : "Location"}
                    className={`bg-gray-100 border-0 text-sm xs:text-base md:text-lg ${isEditMode ? 'text-black' : ''}`}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs xs:text-sm md:text-base font-bold text-gray-900">Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 160) {
                      setFormData(prev => ({ ...prev, bio: e.target.value }))
                    }
                  }}
                  onFocus={() => setFocusedField('bio')}
                  onBlur={() => setFocusedField(null)}
                  disabled={!isEditMode}
                  placeholder={focusedField === 'bio' ? '' : "Say something about yourself."}
                  className={`bg-gray-100 border-0 min-h-[80px] md:min-h-[100px] text-sm xs:text-base md:text-lg ${isEditMode ? 'text-black' : ''}`}
                  rows={4}
                />
                <div className="flex justify-end mt-1">
                  <p className="text-[10px] xs:text-xs md:text-sm text-gray-500">
                    {formData.bio.length}/160
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditMode && (
              <div className="flex gap-2.5 md:gap-3 px-3 md:px-5 pt-4 md:pt-6 pb-6 md:pb-8">
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm xs:text-base md:text-lg py-4 md:py-5"
                >
                  {updateProfileMutation.isPending ? (
                    <span className="flex items-center gap-1.5 md:gap-2">
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                  variant="outline"
                  className="flex-1 border-gray-300 text-sm xs:text-base md:text-lg py-4 md:py-5"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Security Section */}
          {user?.auth_method === 'email' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 md:mb-6">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 md:gap-3">
                  <Lock className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                  <h2 className="text-sm xs:text-base md:text-lg font-semibold text-gray-900">Security</h2>
                </div>
              </div>
              <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div>
                  <Label className="mb-1.5 md:mb-2 text-xs xs:text-sm md:text-base">Password</Label>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 md:px-4 py-2 mb-2.5 md:mb-3">
                    <Input
                      type={showPasswords.current ? "text" : "password"}
                      value="••••••••••"
                      readOnly
                      className="text-sm xs:text-base md:text-lg"
                    />
                    <Eye className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordDialog(true)}
                    className="w-full text-sm xs:text-base md:text-lg py-2 md:py-2.5"
                  >
                    Change Password
                  </Button>
                </div>
                <div>
                  <Label className="mb-1.5 md:mb-2 text-xs xs:text-sm md:text-base">Email</Label>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 md:px-4 py-2 mb-2.5 md:mb-3">
                    <Input
                      type="text"
                      value={currentUser.email || ""}
                      readOnly
                      className="text-sm xs:text-base md:text-lg"
                    />
                    <Mail className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailDialog(true)}
                    className="w-full text-sm xs:text-base md:text-lg py-2 md:py-2.5"
                  >
                    Change Email
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Payment & Receipts Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 md:mb-6">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 md:gap-3">
                <CreditCard className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                <h2 className="text-sm xs:text-base md:text-lg font-semibold text-gray-900">Payment & Receipts</h2>
              </div>
            </div>
            <div className="px-4 md:px-6 pt-4 md:pt-6">
              <Button
                variant="outline"
                onClick={() => setShowPaymentMethods(true)}
                className="w-full justify-start text-sm xs:text-base md:text-lg py-2 md:py-2.5"
              >
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-500" />
                Manage Payment Methods
              </Button>
            </div>
            <div className="p-4 md:p-6">
              <Button
                variant="outline"
                onClick={() => navigate("/transaction-history")}
                className="w-full justify-start text-sm xs:text-base md:text-lg py-2 md:py-2.5"
              >
                <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-500" />
                View Financial Records
              </Button>
            </div>
          </div>

          {/* Saved Content Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 md:mb-6">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 md:gap-3">
                <Heart className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                <h2 className="text-sm xs:text-base md:text-lg font-semibold text-gray-900">Saved Content</h2>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <Button
                variant="outline"
                onClick={() => navigate("/saved")}
                className="w-full justify-start text-sm xs:text-base md:text-lg py-2 md:py-2.5"
              >
                <Heart className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-500" />
                Favorites
              </Button>
            </div>
          </div>

          {/* Help & Support Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 md:mb-6">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 md:gap-3">
                <CircleHelp className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                <h2 className="text-sm xs:text-base md:text-lg font-semibold text-gray-900">Help & Support</h2>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {/* FAQ Section */}
              <div className="space-y-0">
                {faqData.map((faq, index) => (
                  <div key={index}>
                    {index > 0 && <div className="border-t border-gray-100" />}
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between py-3 md:py-4 px-0 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="text-sm xs:text-base md:text-lg font-semibold text-gray-900 text-left flex-1 mr-2 md:mr-3">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 md:h-5 md:w-5 text-gray-500 transition-transform flex-shrink-0 ${expandedFAQ === index ? 'rotate-180' : ''
                          }`}
                      />
                    </button>
                    {expandedFAQ === index && (
                      <div className="pb-3 md:pb-4 px-0">
                        <p className="text-xs xs:text-sm md:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Support Links */}
              <div className="mt-6 md:mt-8 space-y-0">
                <button
                  onClick={() => navigate("/settings/report")}
                  className="w-full text-left py-2.5 md:py-3 px-0 text-sm xs:text-base md:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full text-left py-2.5 md:py-3 px-0 text-sm xs:text-base md:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  Suggest a Nonprofit
                </button>
                <button
                  onClick={() => navigate("/settings/terms")}
                  className="w-full text-left py-2.5 md:py-3 px-0 text-sm xs:text-base md:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => navigate("/settings/privacy")}
                  className="w-full text-left py-2.5 md:py-3 px-0 text-sm xs:text-base md:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => navigate("/settings/about")}
                  className="w-full text-left py-2.5 md:py-3 px-0 text-sm xs:text-base md:text-lg font-semibold   text-gray-900 hover:text-blue-600 transition-colors"
                >
                  About CRWD
                </button>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 md:mb-8">
            <div className="px-4 md:px-6 py-3 md:py-4">
              <button
                onClick={() => {
                  import('@/services/api/auth').then(({ logout }) => {
                    logout().finally(() => {
                      useAuthStore.getState().logout()
                      navigate('/login', { replace: true })
                    })
                  })
                }}
                className="w-full flex items-center justify-center gap-2 text-red-600 font-semibold py-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <div className='flex items-center gap-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                  Logout
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordDialog && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setShowPasswordDialog(false)} />
          <div
            ref={passwordModalRef}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Drag Handle */}
            <div className="sticky top-0 bg-white z-30 flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="bg-white px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-gray-900">Change Password</h2>
              <p className="text-xs xs:text-sm md:text-base text-gray-500">Update your password. Make sure it's strong and secure.</p>
            </div>

            <div className="px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-8">
              <form onSubmit={handlePasswordSubmit} className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                <div>
                  <Label className="text-xs xs:text-sm md:text-base">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      onFocus={handleFocus('currentPassword')}
                      onBlur={() => setFocusedField(null)}
                      placeholder={focusedField === 'currentPassword' ? '' : 'Current Password'}
                      className={`text-sm xs:text-base md:text-lg ${passwordErrors.currentPassword ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-xs xs:text-sm md:text-base text-red-500 mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs xs:text-sm md:text-base">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      onFocus={handleFocus('newPassword')}
                      onBlur={() => setFocusedField(null)}
                      placeholder={focusedField === 'newPassword' ? '' : 'New Password'}
                      className={`text-sm xs:text-base md:text-lg ${passwordErrors.newPassword ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs xs:text-sm md:text-base text-red-500 mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs xs:text-sm md:text-base">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      onFocus={handleFocus('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      placeholder={focusedField === 'confirmPassword' ? '' : 'Confirm New Password'}
                      className={`text-sm xs:text-base md:text-lg ${passwordErrors.confirmPassword ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs xs:text-sm md:text-base text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="mt-4 md:mt-6 mb-2 md:mb-4">
                  <p className="text-sm md:text-base font-semibold text-gray-900 mb-2 md:mb-3">Password Requirements:</p>
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      <p className="text-xs xs:text-sm md:text-base text-gray-700">At least 8 characters</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      <p className="text-xs xs:text-sm md:text-base text-gray-700">One uppercase letter</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      <p className="text-xs xs:text-sm md:text-base text-gray-700">One number</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 md:pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)} className="flex-1 text-sm xs:text-base md:text-lg py-2 md:py-2.5">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={changePasswordMutation.isPending} className="flex-1 text-sm xs:text-base md:text-lg py-2 md:py-2.5">
                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Change Email Modal */}
      {showEmailDialog && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setShowEmailDialog(false)} />
          <div
            ref={emailModalRef}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Drag Handle */}
            <div className="sticky top-0 bg-white z-30 flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="bg-white px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-gray-900">Change Email</h2>
              <p className="text-xs xs:text-sm md:text-base text-gray-500">Update your email address. You'll need to verify your new email address after the change.</p>
            </div>

            <div className="px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-8">
              <form onSubmit={handleEmailSubmit} className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                <div>
                  <Label className="text-xs xs:text-sm md:text-base">New Email</Label>
                  <Input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    onFocus={handleFocus('newEmail')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={focusedField === 'newEmail' ? '' : 'New Email'}
                    className={`text-sm xs:text-base md:text-lg ${emailErrors.newEmail ? "border-red-500" : ""}`}
                  />
                  {emailErrors.newEmail && (
                    <p className="text-xs xs:text-sm md:text-base text-red-500 mt-1">{emailErrors.newEmail}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs xs:text-sm md:text-base">Confirm New Email</Label>
                  <Input
                    type="email"
                    value={emailForm.confirmEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
                    onFocus={handleFocus('confirmEmail')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={focusedField === 'confirmEmail' ? '' : 'Confirm New Email'}
                    className={`text-sm xs:text-base md:text-lg ${emailErrors.confirmEmail ? "border-red-500" : ""}`}
                  />
                  {emailErrors.confirmEmail && (
                    <p className="text-xs xs:text-sm md:text-base text-red-500 mt-1">{emailErrors.confirmEmail}</p>
                  )}
                </div>
                <div className="flex gap-2 pt-3 md:pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowEmailDialog(false)} className="flex-1 text-sm xs:text-base md:text-lg py-2 md:py-2.5">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateEmailMutation.isPending} className="flex-1 text-sm xs:text-base md:text-lg py-2 md:py-2.5">
                    {updateEmailMutation.isPending ? "Sending..." : "Send Verification Code"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* OTP Verification Modal */}
      {showOTPDialog && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setShowOTPDialog(false)} />
          <div
            ref={otpModalRef}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Drag Handle */}
            <div className="sticky top-0 bg-white z-30 flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="bg-white px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-gray-900">Verify Email</h2>
              <p className="text-xs xs:text-sm md:text-base text-gray-500">Enter the verification code sent to your new email address.</p>
            </div>

            <div className="px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-8">
              <form onSubmit={handleOTPSubmit} className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                <div>
                  <Label className="text-xs xs:text-sm md:text-base">Verification Code</Label>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onFocus={handleFocus('otp')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={focusedField === 'otp' ? '' : "Enter 6-digit code"}
                    maxLength={6}
                    className="text-sm xs:text-base md:text-lg"
                  />
                </div>
                <div className="flex gap-2 pt-3 md:pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowOTPDialog(false)} className="flex-1 text-sm xs:text-base md:text-lg py-2 md:py-2.5">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={verifyEmailMutation.isPending} className="flex-1 text-sm xs:text-base md:text-lg py-2 md:py-2.5">
                    {verifyEmailMutation.isPending ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Slide-up Animation Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Toast */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={3000}
      />

      {/* Request Nonprofit Modal */}
      <RequestNonprofitModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />

      <PaymentMethodsSheet
        isOpen={showPaymentMethods}
        onClose={() => setShowPaymentMethods(false)}
      />
      <DiscardSheet
        isOpen={showExitConfirmation}
        onDiscard={confirmExit}
        onClose={() => setShowExitConfirmation(false)}
      />
    </div>
  )
}
