import React from 'react';
import NotificationItem from './NotificationItem';

const notifications = [
  // Regular Notifications
  {
    type: 'mention' as const,
    username: 'Conrad',
    message: 'Conrad mentioned you',
    time: '2m',
  },
  {
    type: 'follow' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
    username: 'Mandy',
    message: 'Mandy followed you.',
    time: '5m',
  },
  {
    type: 'like' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: 'Chad',
    message: 'Chad liked your post',
    time: '10m',
  },
  {
    type: 'comment' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: 'Chad',
    message: 'Chad commented on your post',
    time: '15m',
  },
  {
    type: 'like' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: 'Chad',
    message: 'Chad liked your comment',
    time: '20m',
  },
  {
    type: 'achievement' as const,
    message: 'Congratulations! You have donated 2 months in a row!',
    time: '1h',
  },
  {
    type: 'crwd_activity' as const,
    message: 'Congratulations! Your CRWD has made 10 collective donations',
    time: '2h',
  },
  {
    type: 'crwd_join' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
    username: 'Mandy',
    message: 'Mandy joined March of Dimes',
    time: '4h',
    groupName: 'March of Dimes',
  },
  {
    type: 'event_attend' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: 'Chad',
    message: 'Chad is attending your event',
    time: '5h',
  },
];

// Community Updates notifications
const communityNotifications = [
  {
    type: 'community_post' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    username: 'Jim',
    message: 'Jim posted in a CRWD (MarchofDimes)',
    time: '3h',
    groupName: 'MarchofDimes',
    postContent: 'Check out this new research on birth defects prevention and how we can help families in need...',
  },
  {
    type: 'community_event' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/25.jpg',
    username: 'John',
    message: 'John posted a new event',
    time: '6h',
    eventTitle: 'Community Fundraiser for Education',
    eventDate: 'June 20, 2024 • 3:00 PM',
  },
  {
    type: 'community_donation' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
    username: 'Conrad',
    message: 'Conrad donated to The Red Cross',
    time: '8h',
    organizationName: 'The Red Cross',
    organizationLogo: '/redcross.png'
  },
  {
    type: 'community_interest' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
    username: 'Conrad',
    message: 'Conrad is interested in an event',
    time: '12h',
    eventTitle: 'Health & Wellness Workshop',
  },
  {
    type: 'community_join' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
    username: 'Conrad',
    message: 'Conrad joined HealthisWealth',
    time: '1d',
    groupName: 'HealthisWealth',
  },
];

const NotificationList: React.FC = () => {
  // Group notifications by type
  const regularNotifications = notifications.filter(n =>
    ['mention', 'follow', 'like', 'comment', 'achievement', 'crwd_activity', 'crwd_join', 'event_attend'].includes(n.type)
  );
  const communityUpdates = communityNotifications;

  return (
    <div className="w-full flex flex-col">
      {/* Regular notifications */}
      {regularNotifications.map((n, idx) => (
        <NotificationItem key={`regular-${idx}`} {...n} />
      ))}

      {/* Community Updates section */}
      {communityUpdates.length > 0 && (
        <>
          <div className="px-4 py-3 bg-gray-50 border-t border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Community Updates</h3>
          </div>
          {communityUpdates.map((n, idx) => (
            <NotificationItem key={`community-${idx}`} {...n} />
          ))}
        </>
      )}
    </div>
  );
};

export default NotificationList;