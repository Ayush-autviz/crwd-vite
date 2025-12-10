"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import { login, googleLogin } from "@/services/api/auth"
import { useAuthStore } from "@/stores/store"
import { Toast } from "@/components/ui/toast"

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      console.log('Login successful:', response)
      
      // Store user data and token in the store
      if (response.user) {
        setUser(response.user)
      }
      if (response.access_token) {
        setToken({ access_token: response.access_token, refresh_token: response.refresh_token })
      }
      
      // If last_login_at is null, navigate to nonprofit interests page (new user)
      if (response.user && !response.user.last_login_at) {
        navigate("/non-profit-interests", { 
          state: { fromAuth: true },
          replace: true 
        })
      } else {
        // Navigate to home page for existing users
        navigate("/", {replace: true})
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error)
      setToastMessage(`Login failed: ${error.response?.data?.message || error.message}`)
      setShowToast(true)
    },
  })

  // Google login query
  const googleLoginQuery = useQuery({
    queryKey: ['googleLogin'],
    queryFn: googleLogin,
    enabled: false, // Don't run automatically
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setToastMessage("Please enter both email and password")
      setShowToast(true)
      return
    }

    loginMutation.mutate({
      email: formData.email.trim(),
      password: formData.password,
    })
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await googleLoginQuery.refetch()
      if (result.data) {
        console.log('Google login successful:', result.data)
        window.location.href = result.data.url
      }
    } catch (error) {
      console.error('Google login failed:', error)
      setToastMessage("Google login failed. Please try again.")
      setShowToast(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl p-6">
        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/claim-profile"
              className="text-[#1600ff] hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Google Login Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={googleLoginQuery.isFetching}
          className="w-full h-12 border-gray-300 hover:bg-gray-50 transition-colors rounded-lg mb-4"
        >
          {googleLoginQuery.isFetching ? (
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
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-900">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="janedoe@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="h-12 border-gray-300 bg-gray-50 focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-400"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-900">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="h-12 border-gray-300 bg-gray-50 focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-400 pr-12"
                required
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
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                // onCheckedChange={setRememberMe}
                className="border-gray-300"
              />
              <label htmlFor="remember" className="text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-gray-900 hover:text-gray-700 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <form onSubmit={handleSubmit}>
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className={cn(
              "w-full h-12 bg-indigo-500 text-white font-medium rounded-lg mb-6",
              "transition-colors duration-200",
              loginMutation.isPending && "opacity-50 cursor-not-allowed",
            )}
          >
            {loginMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
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

export default LoginPage
