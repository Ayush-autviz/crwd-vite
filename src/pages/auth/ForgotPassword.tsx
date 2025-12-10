"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { forgotPassword } from "@/services/api/auth"
import { Toast } from "@/components/ui/toast"

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const navigate = useNavigate()

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      console.log('Forgot password successful:', response)
      // Navigate to verify page with email
      navigate("/verify", { state: { email } })
    },
    onError: (error: any) => {
      console.error('Forgot password error:', error)
      setToastMessage(`Failed to send reset code: ${error.response?.data?.message || error.message}`)
      setShowToast(true)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setToastMessage("Please enter your email address")
      setShowToast(true)
      return
    }

    forgotPasswordMutation.mutate({
      email: email.trim(),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Forgot your password?
          </h1>
          <p className="text-sm text-gray-600">
            No worries! Enter your email address and we'll send you a verification code to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-900">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="janedoe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-gray-300 bg-gray-50 focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-400"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={forgotPasswordMutation.isPending || !email.trim()}
            className={cn(
              "w-full h-12 bg-indigo-500 text-white font-medium rounded-lg mb-6",
              "transition-colors duration-200",
              (forgotPasswordMutation.isPending || !email.trim()) && "opacity-50 cursor-not-allowed",
            )}
          >
            {forgotPasswordMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending code...
              </div>
            ) : (
              "Send verification code"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-[#1600ff] hover:underline font-medium"
            >
              Sign in
            </Link>
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

export default ForgotPasswordPage
