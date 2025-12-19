"use client";
import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight, Home, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { getDonationHistory } from "@/services/api/donation";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type")

  const isSuccess = type === "success";
  const isFailure = type === "failure";

  // Fetch transaction history when success
  const { data: donationHistoryData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['donationHistory'],
    queryFn: getDonationHistory,
    enabled: isSuccess,
  });

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if(!type) {
    return null;
  }

  // Extract the most recent transaction
  const transactions = donationHistoryData?.results || [];
  const latestTransaction = transactions[0]; // Most recent transaction is first
  
  // Extract data from transaction
  const monthlyAmount = latestTransaction ? parseFloat(latestTransaction.gross_amount || '0') : 0;
  const donationType = latestTransaction?.donation_type || 'recurring';
  
  // Get causes from transaction
  const causes = latestTransaction?.causes || [];
  const firstCause = causes[0];
  const remainingCount = causes.length > 1 ? causes.length - 1 : 0;
  
  // For one-time donations, also check if there are collectives
  const collectives = latestTransaction?.collectives || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {isSuccess ? (
            <>
              {/* Title */}
              <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
                You're all set!
              </h1>

              {isLoadingHistory ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm text-center">
                  <p className="text-gray-600">Loading transaction details...</p>
                </div>
              ) : latestTransaction ? (
                <>
                  {/* Donation Box Card */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      {/* Purple Icon with Heart */}
                      <div className="w-12 h-12 bg-[#9333EA] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-white fill-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">
                          {donationType === 'recurring' ? 'Monthly Donation Box' : 'Donation'}
                        </h2>
                        <p className="text-base text-gray-600 mb-4">
                          ${monthlyAmount.toFixed(2)} {donationType === 'recurring' ? '/ month' : ''}
                        </p>
                        
                       
                      </div>
                    </div>

                    <div className="h-px bg-gray-200 my-4"></div>
                     {/* Supporting Causes Section */}
                     {firstCause && (
                          <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-2">
                            <div className="w-12 h-12 bg-[#fff] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Heart className="w-6 h-6 text-[#1600ff]" strokeWidth={2} />
                            </div>
                            <span className="text-sm text-gray-700">
                              Supporting {firstCause.name || 'Unknown Cause'}
                              {remainingCount > 0 && ` +${remainingCount} more`}
                            </span>
                          </div>
                        )}
                        {!firstCause && collectives.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-2">
                            <div className="w-12 h-12 bg-[#fff] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Heart className="w-6 h-6 text-[#1600ff]" strokeWidth={2} />
                            </div>
                            <span className="text-sm text-gray-700">
                              Supporting {collectives[0].name || 'Unknown Collective'}
                              {collectives.length > 1 && ` +${collectives.length - 1} more`}
                            </span>
                          </div>
                        )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm text-center">
                  <p className="text-gray-600">No transaction data available.</p>
                </div>
              )}

              {/* View My Donation Box Button */}
              <Button
                onClick={() => navigate("/donation", { replace: true })}
                className="w-full bg-[#1600ff] hover:bg-[#1400e6] text-white py-4 text-base font-semibold rounded-full mb-4 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 fill-white text-white" />
                <span>View My Donation Box</span>
              </Button>

              {/* Go to Homepage Link */}
              <div className="text-center mb-8">
                <button
                  onClick={() => navigate("/", { replace: true })}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Go to Homepage
                </button>
              </div>

              {/* Legal Text */}
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Donations are distributed monthly as grants through the CRWD Foundation, a 501(c)(3) (EIN: 41-2423690).
                </p>
                <p className="text-xs text-gray-500">
                  Tax-deductible receipt sent to your email.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Failure State - Keep existing design */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-8 pt-12 pb-8 text-center bg-gradient-to-br from-red-50 to-rose-50">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                    <XCircle className="w-12 h-12 text-red-600" strokeWidth={2} />
                  </div>
                  
                  <h1 className="text-3xl font-bold mb-3 text-red-900">
                    Payment Failed
                  </h1>
                  
                  <p className="text-lg text-red-700 font-medium">
                    We couldn't process your payment
                  </p>
                </div>

                <div className="px-8 py-8 space-y-6">
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

                  <div className="space-y-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/", { replace: true })}
                      className="w-full border-2 border-gray-300 hover:border-gray-400 py-6 text-base font-semibold"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" />
                        <span>Return to Home</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

