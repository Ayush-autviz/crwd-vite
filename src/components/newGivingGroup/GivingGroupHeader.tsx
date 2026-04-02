import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface GivingGroupHeaderProps {
  color?: string;
  title: string;
  memberCount: number;
  avatar?: string;
  collectiveId?: string;
  isFavorite?: boolean;
  isAdmin?: boolean;
  isJoined?: boolean;
  onShare?: () => void;
  onManageCollective?: () => void;
  onDonate?: () => void;
  onLeave?: () => void;
  onBack?: () => void;
  onJoin?: () => void;
  onMore?: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 1)
    .toUpperCase();
};

export default function GivingGroupHeader({
  title = "Giving Group",
  color,
  memberCount = 0,
  avatar,
  isJoined = false,
  onShare,
  onBack,
  onJoin,
  onMore,
}: GivingGroupHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-100 flex items-center justify-between px-3 md:px-4 py-2.5 h-16 w-full">
      <div className="flex items-center gap-3 overflow-hidden grow">
        <button
          onClick={handleBack}
          className="flex-shrink-0 p-1 hover:bg-gray-50 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          {/* <div className="w-9 h-9 bg-[#1600ff] rounded-xl flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={title} className="w-full h-full object-cover" />
            ) : (
              <span>{getInitials(title)}</span>
            )}
          </div> */}
          <Avatar className='rounded-md w-10 h-10'>
            <AvatarImage src={avatar} />
            <AvatarFallback className='text-white rounded-md font-semibold text-lg sm:text-xl' style={{ backgroundColor: color }}>{getInitials(title)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate tracking-tight">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium whitespace-nowrap">
              {memberCount.toLocaleString()} members
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-2 relative">
        {isJoined && (
          <Button
            variant="outline"
            onClick={onShare}
            className="h-8 rounded-md px-4 text-sm sm:text-base font-bold border-gray-300 text-gray-900 shadow-none hover:bg-gray-50"
          >
            Invite
          </Button>
        )}
        {!isJoined && (
          <Button
            variant="outline"
            onClick={onJoin}
            className="h-8 rounded-md px-4 text-sm sm:text-base font-bold border-gray-300 text-gray-900 shadow-none hover:bg-gray-50"
          >
            Join
          </Button>
        )}
        <button
          onClick={onMore}
          className="p-1 hover:bg-gray-50 rounded-full transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
