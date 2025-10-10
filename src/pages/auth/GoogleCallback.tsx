import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { googleCallback } from "@/services/api/auth";
import { useAuthStore } from "@/stores/store";
import { Card, CardContent } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const code = searchParams.get('code');
  console.log(code, 'code');

  const googleCallbackQuery = useQuery({
    queryKey: ['googleCallback', code],
    queryFn: () => googleCallback(code!),
    enabled: !!code, // Only run if code exists
  });

  useEffect(() => {
    if (!code) {
      setError('No authorization code found');
      return;
    }

    if (googleCallbackQuery.data) {
      console.log('Google callback successful:', googleCallbackQuery.data);
      
      if (googleCallbackQuery.data) {
        setUser(googleCallbackQuery.data.user);
        setToken({access_token: googleCallbackQuery.data.access_token, refresh_token: googleCallbackQuery.data.refresh_token});
        setToastMessage("Google authentication successful!");
        setShowToast(true);
      }
      
      navigate("/", {replace: true});
    }

    if (googleCallbackQuery.error) {
      console.error('Google callback error:', googleCallbackQuery.error);
      const errorMessage = (googleCallbackQuery.error as any)?.response?.data?.message || 
                          googleCallbackQuery.error.message || 
                          'Authentication failed';
      setError(errorMessage);
      setToastMessage(`Authentication failed: ${errorMessage}`);
      setShowToast(true);
    }
  }, [code, googleCallbackQuery.data, googleCallbackQuery.error, setUser, setToken, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Authentication Failed</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Go to Home
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Completing Authentication</h2>
          <p className="text-gray-600">
            Please wait while we complete your Google authentication...
          </p>
          {googleCallbackQuery.isFetching && (
            <p className="text-sm text-gray-500">Processing authorization code...</p>
          )}
        </CardContent>
      </Card>

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
