import React from 'react';
import { Button } from './button';
import { 
  Share2, 
  MessageCircle, 
  Mail, 
  Phone, 
  Globe, 
  ArrowDown,
  Facebook,
  Twitter,
  Linkedin,
  MessageSquare,
  Link,
  ChevronDown
} from 'lucide-react';

interface MobileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  url?: string;
}

interface ShareButtonProps {
  icon: React.ElementType;
  label: string;
  color: string;
  onPress: () => void;
}

const SHARE_OPTIONS = [
  {
    label: 'Facebook',
    color: '#1877F2',
    icon: Facebook,
    platform: 'facebook'
  },
  {
    label: 'Twitter',
    color: '#1DA1F2',
    icon: Twitter,
    platform: 'twitter'
  },
  {
    label: 'LinkedIn',
    color: '#0A66C2',
    icon: Linkedin,
    platform: 'linkedin'
  },
  {
    label: 'WhatsApp',
    color: '#25D366',
    icon: MessageCircle,
    platform: 'whatsapp'
  },
  {
    label: 'Telegram',
    color: '#0088cc',
    icon: MessageSquare,
    platform: 'telegram'
  },
  {
    label: 'Email',
    color: '#EA4335',
    icon: Mail,
    platform: 'email'
  },
  {
    label: 'SMS',
    color: '#63B3ED',
    icon: Phone,
    platform: 'sms'
  },
  {
    label: 'More',
    color: '#3B82F6',
    icon: Share2,
    platform: undefined
  }
];

export function MobileShareModal({ isOpen, onClose, title = '', message, url = '' }: MobileShareModalProps) {
  const handleShare = async (platform?: string) => {
    try {
      let shareMessage = message;
      let shareUrl = url || '';

      if (platform) {
        // Platform specific sharing
        switch (platform) {
          case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || '')}&quote=${encodeURIComponent(message)}`;
            window.open(shareUrl, '_blank');
            break;
          case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url || '')}`;
            window.open(shareUrl, '_blank');
            break;
          case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || '')}&summary=${encodeURIComponent(message)}`;
            window.open(shareUrl, '_blank');
            break;
          case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(message + (url ? '\n' + url : ''))}`;
            window.open(shareUrl, '_blank');
            break;
          case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url || '')}&text=${encodeURIComponent(message)}`;
            window.open(shareUrl, '_blank');
            break;
          case 'email':
            shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message + (url ? '\n\n' + url : ''))}`;
            window.open(shareUrl);
            break;
          case 'sms':
            shareUrl = `sms:?body=${encodeURIComponent(message + (url ? '\n' + url : ''))}`;
            window.open(shareUrl);
            break;
          default:
            // Use Web Share API if available, otherwise fallback to clipboard
            if (navigator.share) {
              await navigator.share({
                title: title,
                text: message,
                url: url,
              });
            } else {
              await navigator.clipboard.writeText(message + (url ? '\n' + url : ''));
              alert('Content copied to clipboard!');
            }
        }
        onClose();
      } else {
        // Use Web Share API if available, otherwise fallback to clipboard
        if (navigator.share) {
          await navigator.share({
            title: title,
            text: message,
            url: url,
          });
        } else {
          await navigator.clipboard.writeText(message + (url ? '\n' + url : ''));
          alert('Content copied to clipboard!');
        }
        onClose();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Error sharing content');
    }
  };

  const ShareButton = ({ icon: Icon, label, color, onPress }: ShareButtonProps) => (
    <button 
      className="flex flex-col items-center w-1/4 mb-5 hover:opacity-80 transition-opacity"
      onClick={onPress}
    >
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm"
        style={{ backgroundColor: color }}
      >
        <Icon size={24} color="white" strokeWidth={2.5} />
      </div>
      <span className="text-xs text-gray-600 text-center font-medium">{label}</span>
    </button>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-5 mb-5" />
        
        {/* Header */}
        <div className="text-center mb-6 px-6">
          <h2 className="text-xl font-bold mb-2">Check out this nonprofit</h2>
        </div>

        {/* Primary Actions */}
        <div className="space-y-3 mb-6 px-6">
          <button
            onClick={() => {
              navigator.clipboard.writeText(url);
              alert('Link copied!');
              onClose();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center"
          >
            <Link className="w-4 h-4 mr-2" />
            Copy Invite Link
          </button>

          <button
            onClick={() => handleShare('email')}
            className="w-full py-3 border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg flex items-center justify-center"
          >
            <Mail className="w-4 h-4 mr-2" />
            Invite by Email
          </button>
        </div>

        {/* Social Sharing */}
        <div className="mb-6 px-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Share directly:
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleShare('facebook')}
              className="flex-shrink-0"
            >
              <img
                src="/socials/facebook.png"
                alt="Facebook"
                className="w-12 h-12"
              />
            </button>

            <img
              src="/socials/instagram.png"
              alt="Instagram"
              className="w-12 h-12"
            />

            <img src="/socials/tiktok.png" alt="TikTok" className="w-12 h-12" />
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center px-6 pb-8">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto gap-1 transition-colors"
          >
            Skip for now
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}