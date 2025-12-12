import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { googleLogin } from "@/services/api/auth";
import { ArrowRight } from "lucide-react";
import NewLogo from "@/assets/newLogo/NewLogo";

export default function NewOnboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const googleLoginQuery = useQuery({
    queryKey: ["googleLogin"],
    queryFn: googleLogin,
    enabled: false, // Don't run automatically
  });

  const handleGoogleLogin = async () => {
    try {
      // Store redirectTo in sessionStorage before redirecting to Google
      if (redirectTo && redirectTo !== '/') {
        sessionStorage.setItem('googleLoginRedirectTo', redirectTo);
      }
      const result = await googleLoginQuery.refetch();
      if (result.data) {
        console.log("Google login successful:", result.data);
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const handleAppleLogin = async () => {
    // TODO: Implement Apple login when API is available
    console.log("Apple login clicked");
    // For now, navigate to claim profile
    navigate(`/claim-profile?redirectTo=${encodeURIComponent(redirectTo)}`);
  };

  const handleEmailLogin = () => {
    // Navigate to claim profile for email registration
    navigate(`/claim-profile?redirectTo=${encodeURIComponent(redirectTo)}`);
  };

  const handleLogin = () => {
    // Navigate to Login page
    navigate(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      {/* <img src="/logo3.png" width={150} height={150} alt="CRWD Logo" className="mb-10" /> */}
      <NewLogo size="lg" />


      {/* Headings */}
      <div className="text-center my-12 space-y-3">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-[800] text-gray-900">
          Stop Wishing You Made a Difference.
        </h1>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-[800] text-[#1600ff]">
          Start Being Someone Who Does.
        </h2>
      </div>

      {/* Auth Buttons */}
      <div className="w-full max-w-md space-y-4 mb-6">
        {/* Apple Button */}
        {/* <Button
          type="button"
          onClick={handleAppleLogin}
          className="w-full h-12 bg-black hover:bg-gray-900 text-white font-medium rounded-lg flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Continue with Apple
        </Button> */}

        {/* Google Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={googleLoginQuery.isFetching}
          className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg border border-gray-300 flex items-center justify-center gap-2"
        >
          {googleLoginQuery.isFetching ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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

        {/* Email Button */}
        <Button
          type="button"
          onClick={handleEmailLogin}
          className="w-full h-12 bg-[#1600ff] hover:bg-[#0039CC] text-white font-medium rounded-lg flex items-center justify-center gap-2"
        >
          Continue with Email
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Terms and Privacy */}
      {/* <p className="text-sm text-gray-500 text-center mb-8 max-w-md">
        By continuing, you agree to our{" "}
        <a href="/terms" className="text-[#1600ff] hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-[#1600ff] hover:underline">
          Privacy Policy
        </a>
      </p> */}

      {/* Login Link */}
      <p className="text-sm text-gray-500 text-center">
        Already have an account?{" "}
        <button
          onClick={handleLogin}
          className="text-[#1600ff] hover:underline font-medium"
        >
          Log in
        </button>
      </p>
    </div>
  );
}

