"use client";

import React, { useState } from "react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { updateEmail, updateEmailVerification } from "@/services/api/auth";
import { Toast } from "@/components/ui/toast";

export default function SettingsEmail() {
  const [formData, setFormData] = useState({
    newEmail: "",
    confirmEmail: "",
  });
  const [errors, setErrors] = useState({
    newEmail: "",
    confirmEmail: "",
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  // Update email mutation
  const updateEmailMutation = useMutation({
    mutationFn: updateEmail,
    onSuccess: (response) => {
      console.log('Update email successful:', response)
      setShowOTPModal(true)
      setToastMessage("Verification code sent to your new email!")
      setShowToast(true)
    },
    onError: (error: any) => {
      console.error('Update email error:', error)
      setToastMessage(`Failed to update email: ${error.response?.data?.message || error.message}`)
      setShowToast(true)
    },
  })

  // Update email verification mutation
  const updateEmailVerificationMutation = useMutation({
    mutationFn: updateEmailVerification,
    onSuccess: (response) => {
      console.log('Email verification successful:', response)
      setToastMessage("Email updated and verified successfully!")
      setShowToast(true)
      setShowOTPModal(false)
      setOtp("")
      setFormData({
        newEmail: "",
        confirmEmail: "",
      })
    },
    onError: (error: any) => {
      console.error('Email verification error:', error)
      setToastMessage(`Verification failed: ${error.response?.data?.message || error.message}`)
      setShowToast(true)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      newEmail: "",
      confirmEmail: "",
    });

    // Validate emails
    const newEmailError = validateEmail(formData.newEmail);
    const confirmEmailError = validateEmail(formData.confirmEmail);

    if (newEmailError) {
      setErrors((prev) => ({ ...prev, newEmail: newEmailError }));
      return;
    }

    if (confirmEmailError) {
      setErrors((prev) => ({ ...prev, confirmEmail: confirmEmailError }));
      return;
    }

    // Validate email confirmation
    if (formData.newEmail !== formData.confirmEmail) {
      setErrors((prev) => ({
        ...prev,
        confirmEmail: "Email addresses do not match",
      }));
      return;
    }

    updateEmailMutation.mutate({
      new_email: formData.newEmail,
    });
  };

  const handleOTPVerification = () => {
    if (otp.length === 6) {
      updateEmailVerificationMutation.mutate({
        verification_code: otp,
      });
    } else {
      setToastMessage("Please enter a valid verification code");
      setShowToast(true);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ProfileNavbar title="Change Email" />

      <div className="flex-1 w-full bg-white mt-0 md:mt-8 overflow-hidden">
        <div className="max-w-2xl mx-auto p-6">
          <Card className="border-none shadow-none">
            <CardHeader>
              {/* <div className="mb-6">
                <BackButton variant="outlined" />
              </div> */}
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Change Email</CardTitle>
              </div>
              <CardDescription>
                Update your email address. You'll need to verify your new email
                address after the change.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="newEmail">New Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={formData.newEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          newEmail: e.target.value,
                        }))
                      }
                      className={errors.newEmail ? "border-red-500" : ""}
                    />
                    {errors.newEmail && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.newEmail}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmEmail">Confirm New Email</Label>
                    <Input
                      id="confirmEmail"
                      type="email"
                      value={formData.confirmEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmEmail: e.target.value,
                        }))
                      }
                      className={errors.confirmEmail ? "border-red-500" : ""}
                    />
                    {errors.confirmEmail && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.confirmEmail}
                      </p>
                    )}
                  </div>

                
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={updateEmailMutation.isPending}
                  >
                    {updateEmailMutation.isPending ? "Sending..." : "Update Email"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        newEmail: "",
                        confirmEmail: "",
                        
                      });
                      setErrors({
                        newEmail: "",
                        confirmEmail: "",
                        
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="h-20" />

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6 space-y-4">
                {/* Modal Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Verify Your New Email
                  </h2>
                  <p className="text-gray-600 text-sm">
                    We've sent a verification code to <span className="font-medium">{formData.newEmail}</span>
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                    }}
                    maxLength={6}
                    className="w-full h-12 border border-gray-300 rounded-lg px-4 bg-white text-gray-900 text-lg text-center font-mono focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleOTPVerification}
                    disabled={otp.length !== 6 || updateEmailVerificationMutation.isPending}
                    className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                  >
                    {updateEmailVerificationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </div>
                    ) : (
                      'Verify & Update Email'
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowOTPModal(false);
                      setOtp("");
                    }}
                    className="w-full h-10 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium"
                  >
                    Cancel
                  </Button>
                </div>
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
