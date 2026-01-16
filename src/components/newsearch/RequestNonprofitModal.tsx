import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { requestCause } from '@/services/api/crwd';
import { Toast } from '@/components/ui/toast';

interface RequestNonprofitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestNonprofitModal({
  isOpen,
  onClose,
}: RequestNonprofitModalProps) {
  const [nonprofitName, setNonprofitName] = useState('');
  const [ein, setEin] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset toast state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset toast after a delay to allow it to show if it was just triggered
      const timer = setTimeout(() => {
        setShowToast(false);
        setToastMessage('');
      }, 3500); // Slightly longer than toast duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nonprofitName.trim() || !ein.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await requestCause({
        name: nonprofitName.trim(),
        ein_number: ein.trim(),
        description: reason.trim() || 'No reason provided',
      });

      // Reset form first
      setNonprofitName('');
      setEin('');
      setReason('');

      // Close modal first
      onClose();

      // Show success toast after modal closes
      setTimeout(() => {
        setToastMessage('Request submitted successfully!');
        setShowToast(true);
      }, 300);
    } catch (error: any) {
      console.error('Error submitting nonprofit request:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit request. Please try again.';
      setToastMessage(errorMessage);
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = nonprofitName.trim() && ein.trim();

  return (
    <>
      {/* Toast notification - render outside modal so it persists */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={3000}
      />

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={onClose}
          />

          {/* Bottom Sheet Modal */}
          <div
            ref={modalRef}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto animate-slide-up"
            style={{
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white  px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-foreground">Request a Nonprofit</h2>
              <button
                onClick={onClose}
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 md:px-6 py-4 md:py-6">
              {/* Introductory Text */}
              <p className="text-xs xs:text-sm md:text-base text-gray-700 mb-4 md:mb-6 leading-relaxed">
                Can't find the nonprofit you're looking for? Let us know and if everything checks out we'll add it within{' '}
                <span className="text-[#1600ff] font-semibold">72 hours</span>.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Nonprofit Name */}
                <div>
                  <label
                    htmlFor="nonprofit-name"
                    className="block text-xs xs:text-sm md:text-base font-medium text-gray-900 mb-1.5 md:mb-2"
                  >
                    Nonprofit Name
                  </label>
                  <Input
                    id="nonprofit-name"
                    type="text"
                    placeholder="e.g., Local Food Bank"
                    value={nonprofitName}
                    onChange={(e) => setNonprofitName(e.target.value)}
                    className="w-full border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm xs:text-base md:text-lg py-2 md:py-2.5"
                  />
                </div>

                {/* EIN */}
                <div>
                  <label
                    htmlFor="ein"
                    className="block text-xs xs:text-sm md:text-base font-medium text-gray-900 mb-1.5 md:mb-2"
                  >
                    EIN (Employer Identification Number)
                  </label>
                  <Input
                    id="ein"
                    type="text"
                    placeholder="e.g., 12-3456789"
                    value={ein}
                    onChange={(e) => setEin(e.target.value)}
                    className="w-full border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm xs:text-base md:text-lg py-2 md:py-2.5"
                  />
                </div>

                {/* Why do you care */}
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-xs xs:text-sm md:text-base font-medium text-gray-900 mb-1.5 md:mb-2"
                  >
                    Why do you care about this cause?
                  </label>
                  <Textarea
                    id="reason"
                    placeholder="Tell us why this nonprofit matters to you..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full border-l-4 border-blue-500 focus:ring-2 focus:ring-blue-500 resize-none text-sm xs:text-base md:text-lg"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 md:pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-sm xs:text-base md:text-lg text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </button>

                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-1.5 md:py-2.5 rounded-full font-medium transition-colors text-sm xs:text-base md:text-lg ${isFormValid && !isSubmitting
                      ? 'bg-gradient-to-r from-[#1600ff] to-purple-700 text-white hover:bg-gray-400'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </>
      )}

      {/* Add slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

