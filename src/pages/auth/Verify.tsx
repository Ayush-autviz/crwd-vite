"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Mail, RefreshCw, Eye, EyeOff } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { resetPassword, forgotPassword } from "@/services/api/auth"
import { Toast } from "@/components/ui/toast"

const VerifyPage: React.FC = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || "your email"
  


  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (response) => {
      console.log('Reset password successful:', response)
      navigate("/login")
    },
    onError: (error: any) => {
      console.error('Reset password error:', error)
      setToastMessage(`Password reset failed: ${error.response?.data?.message || error.message}`)
      setShowToast(true)
    },
  })

  // Resend code mutation
  const resendCodeMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      console.log('Resend code successful:', response)
      setTimeLeft(300) // Reset timer
      setCode(["", "", "", "", "", ""]) // Clear current code
    },
    onError: (error: any) => {
      console.error('Resend code error:', error)
      setToastMessage(`Failed to resend code: ${error.response?.data?.message || error.message}`)
      setShowToast(true)
    },
  })

  const handleCodeChange = (index: number, value: string) => {
    console.log(`handleCodeChange - index: ${index}, value: "${value}"`)
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      console.log('Rejected non-numeric input:', value)
      return
    }
    
    if (value.length > 1) {
      console.log('Rejected multi-character input:', value)
      return // Prevent multiple characters
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    console.log('Updated code:', newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Allow backspace, delete, arrow keys, and numbers
    if (e.key === "Backspace" || e.key === "Delete" || 
        e.key.startsWith("Arrow") || /^\d$/.test(e.key)) {
      
      if (e.key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      return
    }
    
    // Prevent all other keys
    e.preventDefault()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    
    // Only allow numbers in pasted data
    const numericData = pastedData.replace(/\D/g, '').slice(0, 6)
    
    const newCode = numericData.split("").concat(Array(6).fill("")).slice(0, 6)
    setCode(newCode)

    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(val => !val)
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const verificationCode = code.join("")

    if (verificationCode.length !== 6) {
      setToastMessage("Please enter the complete verification code")
      setShowToast(true)
      return
    }

    if (!newPassword.trim()) {
      setToastMessage("Please enter a new password")
      setShowToast(true)
      return
    }

    if (newPassword.length < 6) {
      setToastMessage("Password must be at least 6 characters")
      setShowToast(true)
      return
    }

    if (newPassword !== confirmPassword) {
      setToastMessage("Passwords do not match")
      setShowToast(true)
      return
    }

    resetPasswordMutation.mutate({
      email: email,
      confirmation_code: verificationCode,
      new_password: newPassword,
    })
  }

  const handleResendCode = async () => {
    resendCodeMutation.mutate({
      email: email,
    })
  }

  const isFormComplete = code.every(digit => digit !== "") && newPassword.trim() && confirmPassword.trim() && newPassword === confirmPassword

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl p-4 sm:p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/forgot-password"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Check your email
          </h1>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              We sent a verification code to
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">{email}</span>
            </div>
          </div>
        </div>

        {/* Verification Code Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 block text-center">
              Enter verification code
            </label>
            <div className="flex gap-1.5 sm:gap-2 justify-center px-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  onInput={(e) => {
                    // Additional protection - ensure only numbers
                    const target = e.target as HTMLInputElement
                    if (!/^\d*$/.test(target.value)) {
                      target.value = target.value.replace(/\D/g, '')
                    }
                  }}
                  className={cn(
                    "w-10 h-10 xs:w-12 xs:h-12 md:w-14 md:h-14",
                    "text-base sm:text-lg md:text-xl text-center font-semibold",
                    "border rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400",
                    "transition-colors duration-200 bg-gray-50",
                    digit ? "border-gray-400" : "border-gray-300"
                  )}
                />
              ))}
            </div>
          </div>

          {/* New Password Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 border-gray-300 bg-gray-50 focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 border-gray-300 bg-gray-50 focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={resetPasswordMutation.isPending || !isFormComplete}
            className={cn(
              "w-full h-12 bg-indigo-500 text-white font-medium rounded-lg mb-6",
              "transition-colors duration-200",
              (resetPasswordMutation.isPending || !isFormComplete) && "opacity-50 cursor-not-allowed",
            )}
          >
            {resetPasswordMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Resetting password...
              </div>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>

        {/* Resend Code */}
        <div className="text-center space-y-3 mb-6">
          <div className="text-sm text-gray-600">
            {timeLeft > 0 ? (
              <span>Resend code in {formatTime(timeLeft)}</span>
            ) : (
              <span>Didn't receive the code?</span>
            )}
          </div>

          {timeLeft === 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendCode}
              disabled={resendCodeMutation.isPending}
              className="text-gray-900 hover:text-gray-700 hover:bg-gray-100 font-medium"
            >
              {resendCodeMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Resend code
                </div>
              )}
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  )
}

export default VerifyPage
