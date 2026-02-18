import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Share2 } from 'lucide-react';

interface ActivityCardProps {
  activity: any;
}

// Helper function to get consistent color for avatar
const getConsistentColor = (id: string | number, colors: string[]): string => {
  const hash = id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const avatarColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

// Format date to match App style
const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return '';

  // Check if it's already a relative time string (like "1h ago", "2d ago")
  if (dateString.includes('ago') || dateString.includes('just now')) {
    return dateString;
  }

  let date: Date;
  // Handle DD/MM/YYYY format
  const ddmmyyyyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  } else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) {
    return dateString;
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInSeconds / 3600);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else {
    const currentYear = now.getFullYear();
    const postYear = date.getFullYear();
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
    };
    if (postYear !== currentYear) {
      options.year = 'numeric';
    }
    return date.toLocaleDateString('en-US', options);
  }
};

// Helper to extract name from body text
const extractNameFromBody = (body: string): string | null => {
  if (!body) return null;
  // Common activity patterns
  const actions = [' donated', ' joined', ' created', ' posted', ' commented', ' started', ' updated'];
  for (const action of actions) {
    const index = body.indexOf(action);
    if (index > 0) {
      return body.substring(0, index);
    }
  }
  return null;
};

// Get user initials
const getInitials = (name: string): string => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

export default function ActivityCard({ activity }: ActivityCardProps) {
  // Extract username from activity body (e.g., "@jake_long" -> "jake_long")
  const usernameMatch = activity.body?.match(/@(\w+)/);
  const username = usernameMatch ? usernameMatch[1] : null;

  // Try to get user ID from various possible fields in activity.data
  const userId =
    activity.data?.new_member_id ||
    activity.data?.user_id ||
    activity.data?.donor_id ||
    activity.data?.member_id ||
    activity.data?.creator_id ||
    null;

  // Get user name from activity body or data
  const nameFromBody = extractNameFromBody(activity.body);
  const userName = activity.data?.first_name && activity.data?.last_name
    ? `${activity.data.first_name} ${activity.data.last_name}`
    : activity.data?.username || username || nameFromBody || 'Unknown User';

  // Get profile picture
  const profilePicture = activity.data?.user_profile_picture || '';

  // Get avatar background color - prioritize color from API, then fallback to consistent color
  const avatarId = userId || username || userName;
  const avatarBgColor = activity.data?.user_color || getConsistentColor(avatarId, avatarColors);
  const initials = getInitials(userName);

  // Format timestamp - use created_at for proper date parsing (timestamp is already formatted like "2d")
  const formattedTime = activity.created_at
    ? formatTimeAgo(activity.created_at)
    : activity.timestamp || '';

  // Determine activity description - use body which contains the full description
  const activityDescription = activity.body || activity.title || '';

  // Get profile link
  const profileLink = username ? `/u/${username}` : '#';

  return (
    <Card className="bg-white py-0 rounded-xl border border-gray-200 mb-2 sm:mb-3 md:mb-4 overflow-hidden shadow-none">
      <CardContent className="px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
        <div className="flex gap-2 sm:gap-2.5 md:gap-3">
          {/* Profile Avatar */}
          {profileLink !== '#' ? (
            <Link to={profileLink}>
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex-shrink-0">
                <AvatarImage src={profilePicture} alt={userName} />
                <AvatarFallback
                  style={{ backgroundColor: avatarBgColor }}
                  className="text-white font-bold text-xs sm:text-sm md:text-base"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex-shrink-0">
              <AvatarImage src={profilePicture} alt={userName} />
              <AvatarFallback
                style={{ backgroundColor: avatarBgColor }}
                className="text-white font-bold text-xs sm:text-sm md:text-base"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Timestamp */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              {profileLink !== '#' ? (
                <Link to={profileLink} className="font-bold text-sm xs:text-base md:text-lg text-gray-900 hover:underline">
                  {userName}
                </Link>
              ) : (
                <span className="font-bold text-sm xs:text-base md:text-lg text-gray-900">
                  {userName}
                </span>
              )}
              <span className="text-xs sm:text-sm text-gray-500">
                {formattedTime}
              </span>
            </div>

            {/* Activity Description Box */}
            <div className="bg-green-50 rounded-lg p-2 sm:p-2.5 md:p-3">
              <p className="font-semibold text-sm xs:text-base md:text-lg text-gray-900">
                {activityDescription}
              </p>
            </div>

            {/* Engagement Icons */}
            {/* <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                <span className="text-xs md:text-sm text-gray-600 font-medium">18</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Share2 className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </div>
            </div> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

