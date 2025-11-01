"use client";
import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type")

  const isSuccess = type === "success";
  const isFailure = type === "failure";

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if(!type) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Icon Section */}
            <div className={`px-8 pt-12 pb-8 text-center ${isSuccess ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-rose-50'}`}>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'} mb-6`}>
                {isSuccess ? (
                  <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={2} />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600" strokeWidth={2} />
                )}
              </div>
              
              <h1 className={`text-3xl font-bold mb-3 ${isSuccess ? 'text-green-900' : 'text-red-900'}`}>
                {isSuccess ? "Payment Successful!" : "Payment Failed"}
              </h1>
              
              <p className={`text-lg ${isSuccess ? 'text-green-700' : 'text-red-700'} font-medium`}>
                {isSuccess 
                  ? "Your donation has been processed successfully"
                  : "We couldn't process your payment"
                }
              </p>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8 space-y-6">
              {isSuccess ? (
                <>
                  <div className="text-center space-y-2">
                    <p className="text-gray-600 leading-relaxed">
                      Thank you for your generous donation! Your contribution will make a meaningful difference.
                    </p>
                    <p className="text-sm text-gray-500">
                      You will receive a confirmation email shortly with the transaction details.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          What happens next?
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                          <li>Your donation will be distributed to the selected causes</li>
                          <li>You'll receive a receipt via email</li>
                          <li>Track your impact in your donation history</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <p className="text-gray-600 leading-relaxed">
                      We encountered an issue processing your payment. This could be due to several reasons:
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-900 mb-2">
                          Common issues:
                        </p>
                        <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                          <li>Insufficient funds in your account</li>
                          <li>Card details were incorrect</li>
                          <li>Network connectivity issues</li>
                          <li>Payment was declined by your bank</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                {isSuccess ? (
                  <>
                    <Button
                      asChild
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Link to="/transaction-history" className="flex items-center justify-center gap-2">
                        <span>View Transaction History</span>
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full border-2 border-gray-300 hover:border-gray-400 py-6 text-base font-semibold"
                    >
                      <Link to="/" className="flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" />
                        <span>Return to Home</span>
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Link to="/donation" className="flex items-center justify-center gap-2">
                        <span>Try Again</span>
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full border-2 border-gray-300 hover:border-gray-400 py-6 text-base font-semibold"
                    >
                      <Link to="/" className="flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" />
                        <span>Return to Home</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      asChild
                      className="w-full text-gray-600 hover:text-gray-800 py-4 text-sm"
                    >
                      <Link to="/settings/help" className="flex items-center justify-center gap-2">
                        <span>Need Help? Contact Support</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isSuccess 
                ? "Your payment has been securely processed by Stripe"
                : "If you continue to experience issues, please contact our support team"
              }
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

