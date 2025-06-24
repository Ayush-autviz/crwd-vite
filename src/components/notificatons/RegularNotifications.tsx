import React from 'react';
import NotificationItem from './NotificationItem';

const notifications = [
  // Connect Request
  {
    type: 'connect' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
    username: 'mandy',
    message: 'Mandy would like to connect with you',
    time: '17h',
  },
  // Donation Processed
  {
    type: 'donation' as const,
    message: 'Your $25 monthly donation was processed',
    time: '2h',
  },
  // Mention
  {
    type: 'mention' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
    username: 'conrad',
    message: 'Conrad mentioned you',
    time: '19h',
  },
  // Like
  {
    type: 'like' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: 'chad',
    message: 'Chad liked your post',
    time: '1d',
  },
  // Comment
  {
    type: 'comment' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: 'chad',
    message: 'Chad commented on your post',
    time: '1d',
  },
  // Achievement - 2 months donation
  {
    type: 'achievement' as const,
    message: 'Congratulations! You have donated 2 months in a row!',
    time: '1d',
  },
  // Achievement - CRWD collective donations
  {
    type: 'crwd_activity' as const,
    message: 'Congratulations! Your CRWD has made 10 collective donations',
    time: '1d',
  },
  // CRWD Join
  {
    type: 'crwd_join' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
    username: 'mandy',
    message: 'Mandy joined runforourrights',
    time: '17h',
    groupName: 'runforourrights',
  },
  // Event RSVP
  {
    type: 'event_attend' as const,
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: 'chad',
    message: "Chad RSVP'd to your event",
    time: '1d',
  },
];

const RegularNotifications: React.FC = () => {
  return (
    <div className="w-full flex flex-col bg-white">
      {notifications.map((n, idx) => (
        <NotificationItem key={`regular-${idx}`} {...n} />
      ))}
    </div>
  );
};

export default RegularNotifications; 