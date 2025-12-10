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
  MapPin,
  Camera
} from "lucide-react"
import { useAuthStore } from '@/stores/store'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserProfileById } from "@/services/api/social"
import { updateProfile, changePassword, updateEmail, updateEmailVerification } from "@/services/api/auth"
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
      if (response?.user?.profile_picture && currentUser) {
        setUser({ ...currentUser, profile_picture: response.user.profile_picture })
      }
      queryClient.invalidateQueries({ queryKey: ['userProfile', currentUser?.id] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setShowToast(true)
      setToastMessage('Profile updated successfully!')
      setIsEditMode(false)
      setOriginalData(formData)
      setSelectedImageFile(null)
      setSelectedImageUrl(null)
    },
    onError: () => {
      setShowToast(true)
      setToastMessage('Failed to update profile. Please try again.')
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
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/[0-9]/.test(password)) return "Password must contain at least one number"
    if (!/[!@#$%^&*]/.test(password)) return "Password must contain at least one special character (!@#$%^&*)"
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
      <ProfileNavbar title="Settings" />

      <div className="flex-1 w-full bg-white overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Account Component */}
          <div className="mb-4 md:mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            {/* Header */}
            <div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <h2 className="text-base md:text-lg font-bold text-gray-900">Account</h2>
              </div>
              {!isEditMode && (
                <button
                  onClick={handleEdit}
                  className="text-sm md:text-base font-medium text-blue-600 hover:text-blue-700"
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
                      <AvatarFallback className="bg-purple-600">
                        <User className="h-10 w-10 md:h-12 md:w-12 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-purple-600 flex items-center justify-center">
                      <User className="h-10 w-10 md:h-12 md:w-12 text-white" />
                    </div>
                  )}
                </button>
                {isEditMode && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  </button>
                )}
              </div>
              {isEditMode && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] md:text-xs text-gray-500 mt-1.5 md:mt-2 hover:text-gray-700 text-center px-2"
                >
                  Click to upload profile image (max 5MB)
                </button>
              )}
            </div>

            {/* Input Fields */}
            <div className="px-3 md:px-5 pb-6 md:pb-8 space-y-4 md:space-y-5">
              {/* First Name */}
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs md:text-sm font-bold text-gray-900">First Name</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  disabled={!isEditMode}
                  placeholder="First Name"
                  className="bg-gray-100 border-0 text-sm md:text-base"
                />
              </div>

              {/* Last Name */}
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs md:text-sm font-bold text-gray-900">Last Name</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  disabled={!isEditMode}
                  placeholder="Last Name"
                  className="bg-gray-100 border-0 text-sm md:text-base"
                />
              </div>

              {/* Location */}
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs md:text-sm font-bold text-gray-900">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500" />
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditMode}
                    placeholder="Location"
                    className="bg-gray-100 border-0 pl-9 md:pl-10 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs md:text-sm font-bold text-gray-900">Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 160) {
                      setFormData(prev => ({ ...prev, bio: e.target.value }))
                    }
                  }}
                  disabled={!isEditMode}
                  placeholder="Bio"
                  className="bg-gray-100 border-0 min-h-[80px] md:min-h-[100px] text-sm md:text-base"
                  rows={4}
                />
                <div className="flex justify-end mt-1">
                  <p className="text-[10px] md:text-xs text-gray-500">
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm md:text-base py-2 md:py-2.5"
                >
                  {updateProfileMutation.isPending ? (
                    <span className="flex items-center gap-1.5 md:gap-2">
                      <span className="animate-spin">⏳</span>
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
                  className="flex-1 border-gray-300 text-sm md:text-base py-2 md:py-2.5"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 md:mb-6">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 md:gap-3">
                <Lock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Security</h2>
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs md:text-sm">Password</Label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 md:px-4 py-2 mb-2.5 md:mb-3">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value="••••••••••"
                    readOnly
                    className="text-sm md:text-base"
                  />
                  <Eye className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordDialog(true)}
                  className="w-full text-sm md:text-base py-2 md:py-2.5"
                >
                  Change Password
                </Button>
              </div>
              <div>
                <Label className="mb-1.5 md:mb-2 text-xs md:text-sm">Email</Label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 md:px-4 py-2 mb-2.5 md:mb-3">
                  <Input
                    type="text"
                    value={currentUser.email || ""}
                    readOnly
                    className="text-sm md:text-base"
                  />
                  <Mail className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowEmailDialog(true)}
                  className="w-full text-sm md:text-base py-2 md:py-2.5"
                >
                  Change Email
                </Button>
              </div>
            </div>
          </div>

          {/* Payment & Receipts Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 md:mb-6">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 md:gap-3">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Payment & Receipts</h2>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <Button
                variant="outline"
                onClick={() => navigate("/transaction-history")}
                className="w-full justify-start text-sm md:text-base py-2 md:py-2.5"
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
                <Heart className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Saved Content</h2>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <Button
                variant="outline"
                onClick={() => navigate("/saved")}
                className="w-full justify-start text-sm md:text-base py-2 md:py-2.5"
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
                <CircleHelp className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Help & Support</h2>
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
                      <span className="text-sm md:text-base font-semibold text-gray-900 text-left flex-1 mr-2 md:mr-3">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 md:h-5 md:w-5 text-gray-500 transition-transform flex-shrink-0 ${
                          expandedFAQ === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedFAQ === index && (
                      <div className="pb-3 md:pb-4 px-0">
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Support Links */}
              <div className="mt-6 md:mt-8 space-y-0">
                <button
                  onClick={() => navigate("/settings/report")}
                  className="w-full text-left py-2.5 md:py-3 px-0 text-sm md:text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => navigate("/settings/terms")}
                  className="w-full text-left py-2.5 md:py-3 px-0 text-sm md:text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => navigate("/settings/privacy")}
                  className="w-full text-left py-2.5 md:py-3 px-0 text-sm md:text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => navigate("/settings/about")}
                  className="w-full text-left py-2.5 md:py-3 px-0 text-sm md:text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  About CRWD
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Change Password Bottom Sheet */}
      <Sheet open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <SheetContent side="bottom" className="h-[75vh] max-h-[75vh] p-0 flex flex-col">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <div className="px-3 md:px-4 flex-1 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl md:text-2xl font-bold text-gray-900">Change Password</SheetTitle>
              <SheetDescription className="text-xs md:text-sm text-gray-500">
                Update your password. Make sure it's strong and secure.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handlePasswordSubmit} className="mt-4 md:mt-6 space-y-3 md:space-y-4">
              <div>
                <Label className="text-xs md:text-sm">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className={`text-sm md:text-base ${passwordErrors.currentPassword ? "border-red-500" : ""}`}
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
                  <p className="text-xs md:text-sm text-red-500 mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>
              <div>
                <Label className="text-xs md:text-sm">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className={`text-sm md:text-base ${passwordErrors.newPassword ? "border-red-500" : ""}`}
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
                  <p className="text-xs md:text-sm text-red-500 mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              <div>
                <Label className="text-xs md:text-sm">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className={`text-sm md:text-base ${passwordErrors.confirmPassword ? "border-red-500" : ""}`}
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
                  <p className="text-xs md:text-sm text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              <div className="flex gap-2 pt-3 md:pt-4 pb-4 md:pb-6">
                <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)} className="flex-1 text-sm md:text-base py-2 md:py-2.5">
                  Cancel
                </Button>
                <Button type="submit" disabled={changePasswordMutation.isPending} className="flex-1 text-sm md:text-base py-2 md:py-2.5">
                  {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Change Email Bottom Sheet */}
      <Sheet open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <SheetContent side="bottom" className="h-[75vh] max-h-[75vh] p-0 flex flex-col">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <div className="px-3 md:px-4 flex-1 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl md:text-2xl font-bold text-gray-900">Change Email</SheetTitle>
              <SheetDescription className="text-xs md:text-sm text-gray-500">
                Update your email address. You'll need to verify your new email address after the change.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleEmailSubmit} className="mt-4 md:mt-6 space-y-3 md:space-y-4">
              <div>
                <Label className="text-xs md:text-sm">New Email</Label>
                <Input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  className={`text-sm md:text-base ${emailErrors.newEmail ? "border-red-500" : ""}`}
                />
                {emailErrors.newEmail && (
                  <p className="text-xs md:text-sm text-red-500 mt-1">{emailErrors.newEmail}</p>
                )}
              </div>
              <div>
                <Label className="text-xs md:text-sm">Confirm New Email</Label>
                <Input
                  type="email"
                  value={emailForm.confirmEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
                  className={`text-sm md:text-base ${emailErrors.confirmEmail ? "border-red-500" : ""}`}
                />
                {emailErrors.confirmEmail && (
                  <p className="text-xs md:text-sm text-red-500 mt-1">{emailErrors.confirmEmail}</p>
                )}
              </div>
              <div className="flex gap-2 pt-3 md:pt-4 pb-4 md:pb-6">
                <Button type="button" variant="outline" onClick={() => setShowEmailDialog(false)} className="flex-1 text-sm md:text-base py-2 md:py-2.5">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateEmailMutation.isPending} className="flex-1 text-sm md:text-base py-2 md:py-2.5">
                  {updateEmailMutation.isPending ? "Sending..." : "Send Verification Code"}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* OTP Verification Bottom Sheet */}
      <Sheet open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <SheetContent side="bottom" className="h-[50vh] max-h-[50vh] p-0 flex flex-col">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <div className="px-3 md:px-4 flex-1 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl md:text-2xl font-bold text-gray-900">Verify Email</SheetTitle>
              <SheetDescription className="text-xs md:text-sm text-gray-500">
                Enter the verification code sent to your new email address.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleOTPSubmit} className="mt-4 md:mt-6 space-y-3 md:space-y-4">
              <div>
                <Label className="text-xs md:text-sm">Verification Code</Label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-sm md:text-base"
                />
              </div>
              <div className="flex gap-2 pt-3 md:pt-4 pb-4 md:pb-6">
                <Button type="button" variant="outline" onClick={() => setShowOTPDialog(false)} className="flex-1 text-sm md:text-base py-2 md:py-2.5">
                  Cancel
                </Button>
                <Button type="submit" disabled={verifyEmailMutation.isPending} className="flex-1 text-sm md:text-base py-2 md:py-2.5">
                  {verifyEmailMutation.isPending ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Toast */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  )
}

