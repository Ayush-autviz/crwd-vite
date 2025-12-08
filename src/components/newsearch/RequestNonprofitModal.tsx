import { useState, useRef, useEffect } from 'react';
import { X, Send, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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
  const modalRef = useRef<HTMLDivElement>(null);

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
    if (!nonprofitName.trim() || !ein.trim() || !reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement API call to submit nonprofit request
      console.log('Submitting nonprofit request:', {
        nonprofitName,
        ein,
        reason,
      });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      setNonprofitName('');
      setEin('');
      setReason('');
      onClose();
      
      // TODO: Show success toast
    } catch (error) {
      console.error('Error submitting nonprofit request:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = nonprofitName.trim() && ein.trim() && reason.trim();

  if (!isOpen) return null;

  return (
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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-foreground">Request a Nonprofit</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Introductory Text */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            Can't find the nonprofit you're looking for? Let us know and if everything checks out we'll add it within{' '}
            <span className="text-[#1600ff] font-semibold">72 hours</span>.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nonprofit Name */}
            <div>
              <label
                htmlFor="nonprofit-name"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Nonprofit Name
              </label>
              <Input
                id="nonprofit-name"
                type="text"
                placeholder="e.g., Local Food Bank"
                value={nonprofitName}
                onChange={(e) => setNonprofitName(e.target.value)}
                className="w-full border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* EIN */}
            <div>
              <label
                htmlFor="ein"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                EIN (Employer Identification Number)
              </label>
              <Input
                id="ein"
                type="text"
                placeholder="e.g., 12-3456789"
                value={ein}
                onChange={(e) => setEin(e.target.value)}
                className="w-full border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Why do you care */}
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Why do you care about this cause?
              </label>
              <Textarea
                id="reason"
                placeholder="Tell us why this nonprofit matters to you..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full border-l-4 border-blue-500 focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>

              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors ${
                  isFormValid && !isSubmitting
                    ? 'bg-gradient-to-r from-[#1600ff] to-purple-700 text-white hover:bg-gray-400'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                Submit Request
              </Button>
            </div>
          </form>
        </div>

      </div>

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

