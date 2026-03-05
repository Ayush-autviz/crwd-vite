import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  // Determine activity type
  const isDonation = activity.title === 'New Donation' || activity.body?.toLowerCase().includes('donated');
  const isJoin = activity.title === 'New Member' || activity.body?.toLowerCase().includes('joined');

  // Format activity body (remove username and amount if it's already in the header)
  const formatActivityBody = (bodyText: string) => {
    if (!bodyText) return '';

    if (isDonation) {
      // Input: "Conrad McMurray donated $5 to Atlanta Mission and 12 others"
      const donationMatch = bodyText.match(/^(.*?) (donated) (\$[\d,.]+) (to) (.*)$/i);
      if (donationMatch) {
        return `${donationMatch[2].charAt(0).toUpperCase() + donationMatch[2].slice(1)} ${donationMatch[4]} ${donationMatch[5]}`;
      }
    }

    if (isJoin) {
      // Input: "Chad F. joined Everything Everywhere All At Once"
      const joinMatch = bodyText.match(/^(.*?) (joined) (.*)$/i);
      if (joinMatch) {
        return `${joinMatch[2].charAt(0).toUpperCase() + joinMatch[2].slice(1)} ${joinMatch[3]}`;
      }
    }

    return bodyText;
  };

  const activityDescription = formatActivityBody(activity.body || activity.title || '');

  // Get profile link
  const profileLink = username ? `/u/${username}` : '#';

  return (
    <div className="bg-white rounded-2xl mb-3 overflow-hidden shadow-none">
      <div className="">
        {/* Top Section: Profile info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {profileLink !== '#' ? (
              <Link to={profileLink} className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={profilePicture} alt={userName} />
                  <AvatarFallback
                    style={{ backgroundColor: avatarBgColor }}
                    className="text-white font-bold text-sm"
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold text-sm md:text-base text-gray-900 hover:underline">
                    {userName}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={profilePicture} alt={userName} />
                  <AvatarFallback
                    style={{ backgroundColor: avatarBgColor }}
                    className="text-white font-bold text-sm"
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold text-sm md:text-base text-gray-900">
                    {userName}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className={`rounded-xl p-2.5 ${isDonation ? 'bg-green-50' : isJoin ? 'bg-indigo-50' : 'bg-gray-50'
          }`}>
          <p className="text-sm md:text-base text-gray-700 font-medium leading-normal">
            {activityDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

