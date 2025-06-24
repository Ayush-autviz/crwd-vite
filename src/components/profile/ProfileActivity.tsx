import React from 'react';
import { Link } from 'react-router-dom';
import type { PostDetail } from '@/lib/types';
import ProfileActivityCard from './ProfileActivityCard';



interface ProfileActivityProps {
  posts: PostDetail[];
  showLabel?: boolean;
}

const ProfileActivity: React.FC<ProfileActivityProps> = ({ posts, showLabel }) => (
  <div className="w-full">
    {showLabel && <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>}
    <div className="space-y-4">
      {posts.length > 0 && posts.map((post, idx) => (
        // <Link to={`/posts/${post.id}`}>
        <ProfileActivityCard key={idx} post={post} />
        // </Link>
      ))}
    </div>
  </div>
);

export default ProfileActivity;