"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Mail, RefreshCw } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

const VerifyPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
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

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6)
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
      // toast.error("Please enter the complete verification code")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // toast.success("Email verified successfully!", {
      //   description: "Welcome to CRWD!",
      // })

      navigate("/interests")
    } catch (error) {
      // toast.error("Invalid verification code", {
      //   description: "Please check your code and try again.",
      // })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // toast.success("Verification code sent!", {
      //   description: "Check your email for the new code.",
      // })

      setTimeLeft(300) // Reset timer
      setCode(["", "", "", "", "", ""]) // Clear current code
    } catch (error) {
      // toast.error("Failed to resend code", {
      //   description: "Please try again later.",
      // })
    } finally {
      setIsResending(false)
    }
  }

  const isCodeComplete = code.every(digit => digit !== "")

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
                  to="/forgot-password"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </div>

              {/* Logo and Header */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <img src="/logo3.png" width={80} height={80} alt="CRWD Logo" className="drop-shadow-sm" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-gray-900">Check your email</h1>
                  <div className="space-y-1">
                    <p className="text-gray-600 text-sm">
                      We sent a verification code to
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Code Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block text-center">
                    Enter verification code
                  </label>
                  <div className="flex gap-2 justify-center">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className={cn(
                          "w-12 h-12 text-center text-lg font-semibold border rounded-lg",
                          "focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900",
                          "transition-colors duration-200",
                          digit ? "border-gray-900 bg-gray-50" : "border-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || !isCodeComplete}
                    className={cn(
                      "w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium",
                      "transition-colors duration-200",
                      (isLoading || !isCodeComplete) && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </div>
                    ) : (
                      "Verify email"
                    )}
                  </Button>
                </div>
              </form>

              {/* Resend Code */}
              <div className="text-center space-y-3">
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
                    disabled={isResending}
                    className="text-gray-900 hover:text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    {isResending ? (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default VerifyPage
