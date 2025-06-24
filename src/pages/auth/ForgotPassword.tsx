"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // toast.success("Verification code sent!", {
      //   description: "Check your email for the verification code.",
      // })

      // Navigate to verify page with email
      navigate("/verify", { state: { email } })
    } catch (error) {
      // toast.error("Failed to send verification code", {
      //   description: "Please try again later.",
      // })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] [background-size:20px_20px]"></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center p-4 md:p-8 min-h-screen">
        <div className="w-full max-w-md">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-8 space-y-6">
              {/* Back Button */}
              <div className="flex items-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login
                </Link>
              </div>

              {/* Logo and Header */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <img src="/logo3.png" width={80} height={80} alt="CRWD Logo" className="drop-shadow-sm" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-gray-900">Forgot your password?</h1>
                  <p className="text-gray-600 text-sm">
                    No worries! Enter your email address and we'll send you a verification code to reset your password.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 pl-10 border-gray-300 focus-visible:border-gray-900 focus-visible:ring-gray-900/10 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className={cn(
                      "w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium",
                      "transition-colors duration-200",
                      (isLoading || !email.trim()) && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending code...
                      </div>
                    ) : (
                      "Send verification code"
                    )}
                  </Button>
                </div>
              </form>

              {/* Footer */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-gray-900 hover:text-gray-700 font-medium hover:underline transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
