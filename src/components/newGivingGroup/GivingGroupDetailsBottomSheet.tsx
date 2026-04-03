import { useState, useEffect, useMemo } from 'react';
import { Bell, UserPlus, Settings, Star, X, SquarePen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Nonprofit {
  id: number;
  name?: string;
  logo?: string;
  image?: string;
  mission?: string;
  description?: string;
  cause?: {
    id: number;
    name: string;
    logo?: string;
    image?: string;
    mission?: string;
    description?: string;
  };
}

interface GivingGroupDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  groupData: {
    id: string;
    name: string;
    founderName: string;
    memberCount: number;
    donationCount: number;
    nonprofitCount: number;
    description: string;
    avatar?: string;
    color?: string;
  };
  nonprofits: Nonprofit[];
  isAdmin?: boolean;
  isJoined?: boolean;
  onInvite?: () => void;
  onNotifications?: () => void;
  onManage?: () => void;
  onDelete?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  onStatClick?: (tab: 'Nonprofits' | 'Members' | 'Donations') => void;
  donationBox?: any;
  isFavorited?: boolean;
  onFavorite?: () => void;
}

export default function GivingGroupDetailsBottomSheet({
  isOpen,
  onClose,
  groupData,
  nonprofits,
  isAdmin = false,
  isJoined = false,
  onInvite,
  onNotifications,
  onManage,
  onDelete,
  onJoin,
  onLeave,
  onStatClick,
  donationBox,
  isFavorited = false,
  onFavorite,
}: GivingGroupDetailsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const existingCauseIds = useMemo(() => {
    const ids = new Set<number>();
    if (donationBox?.box_causes && Array.isArray(donationBox.box_causes)) {
      donationBox.box_causes.forEach((boxCause: any) => {
        if (boxCause.cause?.id) {
          ids.add(boxCause.cause.id);
        }
      });
    }
    return ids;
  }, [donationBox?.box_causes]);

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

  if (!isVisible) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 1)
      .toUpperCase();
  };

  const wordLimit = 25;
  const words = (groupData.description || '').split(/\s+/);
  const isOverLimit = words.length > wordLimit;
  const canExpand = isOverLimit;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] transition-opacity duration-300",
        isAnimating ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl transition-transform duration-300 max-h-[90vh] overflow-hidden flex flex-col mx-auto",
          isAnimating ? "translate-y-0" : "translate-y-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-3">
          <div className="w-12 h-1 bg-gray-400 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mt-2">
            <Avatar className="w-17 h-17 rounded-xl">
              <AvatarImage src={groupData.avatar} />
              <AvatarFallback
                className="text-white text-3xl font-bold rounded-xl"
                style={{ backgroundColor: groupData.color || '#1600ff' }}
              >
                {getInitials(groupData.name)}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4">
              {groupData.name}
            </h2>
            <p className="text-base sm:text-lg text-gray-800 ">
              Founded by {groupData.founderName} · {groupData.memberCount.toLocaleString()} members
            </p>
            <div className="text-base sm:text-lg text-gray-800 mt-1 font-normal ">
              {!isExpanded && canExpand ? (
                <>
                  {words.slice(0, wordLimit).join(' ')}
                  <span
                    onClick={() => setIsExpanded(true)}
                    className="text-[#4B5563] font-bold ml-1 hover:underline cursor-pointer select-none"
                  >
                    ... more
                  </span>
                </>
              ) : (
                <>
                  {groupData.description}
                  {isExpanded && canExpand && (
                    <span
                      onClick={() => setIsExpanded(false)}
                      className="text-[#4B5563] font-bold ml-1 hover:underline cursor-pointer select-none"
                    >
                      Read Less
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-0 mt-4 border border-gray-300 rounded-xl overflow-hidden divide-x divide-gray-300">
            <div
              className="flex flex-col items-center py-2 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onStatClick?.('Members')}
            >
              <span className="text-xl font-bold text-gray-900">{groupData.memberCount}</span>
              <span className="text-sm font-medium text-gray-500 ">members</span>
            </div>
            <div
              className="flex flex-col items-center py-2 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onStatClick?.('Donations')}
            >
              <span className="text-xl font-bold text-gray-900">{groupData.donationCount}</span>
              <span className="text-sm font-medium text-gray-500 ">donations</span>
            </div>
            <div
              className="flex flex-col items-center py-2 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onStatClick?.('Nonprofits')}
            >
              <span className="text-xl font-bold text-gray-900">{groupData.nonprofitCount}</span>
              <span className="text-sm font-medium text-gray-500 ">nonprofits</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-center gap-6 sm:gap-14 px-2 mt-4">
            <ActionButton icon={<UserPlus className="w-6 h-6" />} label="Invite" onClick={onInvite} />
            <ActionButton
              icon={<Star className={cn("w-6 h-6", isFavorited && "fill-yellow-300 text-yellow-300")} />}
              label={isFavorited ? "Saved" : "Save"}
              onClick={onFavorite}
            />
            {isAdmin && <ActionButton icon={<SquarePen className="w-6 h-6" />} label="Manage" onClick={onManage} />}
          </div>

          {/* Nonprofits Section */}
          <div className="mt-10">
            <h3 className="text-sm sm:text-base font-bold text-gray-500 uppercase tracking-wide mb-4">
              Nonprofits in this group
            </h3>
            <div className="space-y-0">
              {nonprofits.map((np) => {
                const cause = np.cause || np;
                const name = cause.name || np.name || 'Unknown Nonprofit';
                const logo = cause.logo || cause.image || np.logo || np.image;
                const initials = name.charAt(0).toUpperCase();
                const causeId = cause.id || np.id;
                const isInBox = existingCauseIds.has(causeId);

                return (
                  <div key={np.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 grow">
                    <div className="flex items-center gap-3 max-w-[87%]">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg">
                        <AvatarImage src={logo} />
                        <AvatarFallback className="bg-gray-100 text-gray-500 text-xs font-bold rounded-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-base sm:text-lg font-semibold text-gray-900">{name}</span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onJoin?.();
                      }}
                      className={`text-sm font-bold ${isInBox ? 'text-gray-400' : 'text-[#1600ff]'}`}
                    >
                      {isInBox ? 'Edit' : '+Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-10 space-y-3">
            {isAdmin ? (
              <Button
                onClick={onDelete}
                className="w-full h-14 rounded-xl bg-white border border-gray-300 text-red-500 font-semibold text-base hover:bg-red-50 shadow-none"
              >
                Delete group
              </Button>
            ) : (
              isJoined ? (
                <Button
                  onClick={onLeave}
                  className="w-full h-14 rounded-xl bg-white border border-gray-300 text-red-500 font-semibold text-base hover:bg-red-50 shadow-none"
                >
                  Leave group
                </Button>
              ) : (
                <Button
                  onClick={onJoin}
                  className="w-full h-14 rounded-xl bg-white border border-gray-300 text-gray-900 font-semibold text-base hover:bg-gray-50 shadow-none "
                >
                  Join group
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group transition-all"
    >
      <div className="w-14 h-14 rounded-full bg-[#f6f5ed] flex items-center justify-center text-gray-700 group-hover:bg-gray-100 transition-colors border border-gray-200">
        {icon}
      </div>
      <span className="text-sm sm:text-base font-semibold text-gray-600">{label}</span>
    </button>
  );
}
