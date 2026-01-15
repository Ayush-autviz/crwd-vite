import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CreditCard, Plus, Loader2 } from "lucide-react";
import { getPaymentMethod, updatePaymentMethod } from "../../services/api/donation";

interface PaymentMethodsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PaymentMethodsSheet({
    isOpen,
    onClose,
}: PaymentMethodsSheetProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isOpen) {
            setIsVisible(true);
            setIsAnimating(false);
            timer = setTimeout(() => setIsAnimating(true), 20);
        } else if (isVisible) {
            setIsAnimating(false);
            timer = setTimeout(() => setIsVisible(false), 300);
        }

        return () => clearTimeout(timer);
    }, [isOpen, isVisible]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const { data: paymentMethodsData, isLoading } = useQuery({
        queryKey: ["paymentMethods"],
        queryFn: getPaymentMethod,
        enabled: isOpen, // Only fetch when open
    });

    const updateMethodMutation = useMutation({
        mutationFn: () => updatePaymentMethod({ return_url: window.location.href }),
        onSuccess: (data: any) => {
            // Assuming the API returns a URL to redirect to (Stripe Portal)
            if (data?.url) {
                window.location.href = data.url;
            }
        },
        onError: (error) => {
            console.error("Failed to get update URL", error);
        },
    });

    const handleAddPaymentMethod = () => {
        updateMethodMutation.mutate();
    };

    // Helper to format expiry
    const formatExpiry = (month: number, year: number) => {
        return `${month.toString().padStart(2, '0')}/${year}`;
    };

    // Helper to get brand icon (simplified)
    const getBrandIcon = (_brand: string) => {
        // In a real app we might map 'visa', 'mastercard' to specific SVGs
        // For now, using generic CreditCard icon for all, or text
        return <CreditCard className="w-6 h-6 text-blue-600" />;
    };

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-t-3xl w-full transform transition-transform duration-300 max-h-[90vh] flex flex-col ${isAnimating ? "translate-y-0" : "translate-y-full"
                    }`}
                style={{
                    transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-3 shrink-0" />

                {/* Header */}
                <div className="px-6 mb-4 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your payment methods for donations
                    </p>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto px-6 pb-6 flex-1">

                    {/* Add/Update Button */}
                    <button
                        onClick={handleAddPaymentMethod}
                        disabled={updateMethodMutation.isPending}
                        className="w-full bg-blue-600 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-medium mb-6 hover:bg-blue-700 transition-colors disabled:opacity-70"
                    >
                        {updateMethodMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                        {paymentMethodsData?.payment_method ? "Update Payment Method" : "Add Payment Method"}
                    </button>

                    {/* List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            // Skeleton Loading
                            <>
                                <div className="border border-gray-100 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                                    <div className="w-12 h-8 bg-gray-200 rounded" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                                    </div>
                                </div>
                            </>
                        ) : paymentMethodsData?.payment_method ? (
                            <div className="border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                                <div className="w-12 h-8 bg-gray-50 rounded flex items-center justify-center border border-gray-100">
                                    {getBrandIcon(paymentMethodsData.payment_method.brand)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 capitalize">
                                            {paymentMethodsData.payment_method.brand} •••• {paymentMethodsData.payment_method.last4}
                                        </span>
                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">Default</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Expires {formatExpiry(paymentMethodsData.payment_method.exp_month, paymentMethodsData.payment_method.exp_year)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No payment methods found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-blue-50/50 mt-auto shrink-0 mb-4">
                    <p className="text-xs text-gray-500 text-center px-4">
                        Your payment information is securely encrypted and stored. We never share your payment details with nonprofits or third parties.
                    </p>
                </div>

                <div onClick={handleClose} className="p-4 text-center mt-4 border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
                    Close
                </div>

            </div>
        </div>
    );
}
