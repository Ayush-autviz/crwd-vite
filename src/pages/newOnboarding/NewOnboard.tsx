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
  const isFromCreateCollective = redirectTo === '/create-crwd';
  const isFromCollective = redirectTo.includes('/groupcrwd/');

  const googleLoginQuery = useQuery({
    queryKey: ["googleLogin"],
    queryFn: () => googleLogin({}, 'Google'),
    enabled: false, // Don't run automatically
  });

  const appleLoginQuery = useQuery({
    queryKey: ["appleLogin"],
    queryFn: () => googleLogin({}, 'SignInWithApple'),
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
      {/* <NewLogo size="lg" /> */}
      <img src="/icons/FullLogo.png" width={180} height={180} alt="CRWD Logo" className="mb-10" />


      {/* Headings */}
      <div className="text-center my-12 space-y-3">
        {isFromCreateCollective ? (
          <>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[800] text-[#1600ff]">
              Start Your Movement.
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[800] text-gray-900">
              Create Your Collective & Lead Change
            </h2>
          </>
        ) : isFromCollective ? (
          <>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[800] text-[#1600ff]">
              Join a Movement.
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[800] text-gray-900">
              Connect with a Collective
            </h2>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[800] text-gray-900">
              Stop Wishing You Made a Difference.
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[800] text-[#1600ff]">
              Start Being Someone Who Does.
            </h2>
          </>
        )}
      </div>

      {/* Auth Buttons */}
      <div className="w-full max-w-md space-y-4 mb-6">
        {/* Apple Button */}
        <Button
          type="button"
          onClick={() => handleAppleLogin()}
          disabled={appleLoginQuery.isFetching}
          className="w-full h-12 bg-black hover:bg-gray-900 text-white font-medium rounded-lg flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 30 30" style={{ fill: "#FFFFFF" }}>
            <path d="M25.565,9.785c-0.123,0.077-3.051,1.702-3.051,5.305c0.138,4.109,3.695,5.55,3.756,5.55 c-0.061,0.077-0.537,1.963-1.947,3.94C23.204,26.283,21.962,28,20.076,28c-1.794,0-2.438-1.135-4.508-1.135 c-2.223,0-2.852,1.135-4.554,1.135c-1.886,0-3.22-1.809-4.4-3.496c-1.533-2.208-2.836-5.673-2.882-9 c-0.031-1.763,0.307-3.496,1.165-4.968c1.211-2.055,3.373-3.45,5.734-3.496c1.809-0.061,3.419,1.242,4.523,1.242 c1.058,0,3.036-1.242,5.274-1.242C21.394,7.041,23.97,7.332,25.565,9.785z M15.001,6.688c-0.322-1.61,0.567-3.22,1.395-4.247 c1.058-1.242,2.729-2.085,4.17-2.085c0.092,1.61-0.491,3.189-1.533,4.339C18.098,5.937,16.488,6.872,15.001,6.688z"></path>
          </svg>
          Continue with Apple
        </Button>

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
      <p className="text-xs sm:text-sm md:text-base  text-gray-500 text-center mb-8 max-w-md">
        By continuing, you agree to our{" "}
        <a href="/terms" className="text-[#1600ff] hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-[#1600ff] hover:underline">
          Privacy Policy
        </a>
      </p>

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

