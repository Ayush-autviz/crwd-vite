"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, Eye, EyeOff, Check } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Check password strength
    if (name === "password") {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      })
    }
  }

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // toast.success("Account created successfully!", {
      //   description: "Welcome to CRWD! Please verify your email.",
      // })
      navigate("/verify")
    } catch (error) {
      // toast.error("Failed to create account", {
      //   description: "Please try again later.",
      // })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // toast.success("Google signup successful!")
      navigate("/interests")
    } catch (error) {
      // toast.error("Google signup failed")
    } finally {
      setIsGoogleLoading(false)
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
              {/* Logo and Header */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <img src="/logo3.png" width={80} height={80} alt="CRWD Logo" className="drop-shadow-sm" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
                  <p className="text-gray-600 text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-gray-900 hover:text-gray-700 font-medium hover:underline transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>

              {/* Google Signup Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="w-full h-11 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("firstName")}
                      onBlur={() => setFocusedField(null)}
                      className="h-10 border-gray-300 focus-visible:border-gray-900 focus-visible:ring-gray-900/10 transition-colors duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("lastName")}
                      onBlur={() => setFocusedField(null)}
                      className="h-10 border-gray-300 focus-visible:border-gray-900 focus-visible:ring-gray-900/10 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="h-10 border-gray-300 focus-visible:border-gray-900 focus-visible:ring-gray-900/10 transition-colors duration-200"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className="h-10 border-gray-300 focus-visible:border-gray-900 focus-visible:ring-gray-900/10 pr-10 transition-colors duration-200"
                      required
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
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || !isPasswordStrong}
                    className={cn(
                      "w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium",
                      "transition-colors duration-200",
                      (isLoading || !isPasswordStrong) && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </div>
              </form>

              {/* Terms */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{" "}
                  <Link to="/settings/terms" className="text-gray-700 hover:text-gray-900 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/settings/privacy" className="text-gray-700 hover:text-gray-900 hover:underline">
                    Privacy Policy
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

export default SignupPage
