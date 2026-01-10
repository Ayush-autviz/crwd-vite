"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
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
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
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
        navigate(`/non-profit-interests?redirectTo=${encodeURIComponent(redirectTo)}`, {
          state: { fromAuth: true },
          replace: true
        })
      } else {
        // Navigate to redirectTo if available, otherwise home page for existing users
        navigate(redirectTo, { replace: true })
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
    queryFn: () => googleLogin({}, 'Google'),
    enabled: false, // Don't run automatically
  })

  const appleLoginQuery = useQuery({
    queryKey: ["appleLogin"],
    queryFn: () => googleLogin({}, 'SignInWithApple'),
    enabled: false, // Don't run automatically
  });

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
      // Store redirectTo in sessionStorage before redirecting to Google
      if (redirectTo && redirectTo !== '/') {
        sessionStorage.setItem('googleLoginRedirectTo', redirectTo);
      }
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

  const handleAppleLogin = async () => {
    try {
      // Store redirectTo in sessionStorage before redirecting to Google
      if (redirectTo && redirectTo !== '/') {
        sessionStorage.setItem('appleLoginRedirectTo', redirectTo);
      }
      const result = await appleLoginQuery.refetch();
      if (result.data) {
        console.log("Apple login successful:", result.data);
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error("Apple login failed:", error);
    }
  };

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

        <Button
          type="button"
          onClick={() => handleAppleLogin()}
          disabled={appleLoginQuery.isFetching}
          className="w-full h-12 mb-2 md:mb-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 30 30" style={{ fill: "#FFFFFF" }}>
            <path d="M25.565,9.785c-0.123,0.077-3.051,1.702-3.051,5.305c0.138,4.109,3.695,5.55,3.756,5.55 c-0.061,0.077-0.537,1.963-1.947,3.94C23.204,26.283,21.962,28,20.076,28c-1.794,0-2.438-1.135-4.508-1.135 c-2.223,0-2.852,1.135-4.554,1.135c-1.886,0-3.22-1.809-4.4-3.496c-1.533-2.208-2.836-5.673-2.882-9 c-0.031-1.763,0.307-3.496,1.165-4.968c1.211-2.055,3.373-3.45,5.734-3.496c1.809-0.061,3.419,1.242,4.523,1.242 c1.058,0,3.036-1.242,5.274-1.242C21.394,7.041,23.97,7.332,25.565,9.785z M15.001,6.688c-0.322-1.61,0.567-3.22,1.395-4.247 c1.058-1.242,2.729-2.085,4.17-2.085c0.092,1.61-0.491,3.189-1.533,4.339C18.098,5.937,16.488,6.872,15.001,6.688z"></path>
          </svg>
          Continue with Apple
        </Button>

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
