import React from 'react';
import { Plus, MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';
import ProfileActivity from '../profile/ProfileActivity';
import { profileActivity } from '@/lib/profile/profileActivity';

const updates = [
  {
    user: 'Chad',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    time: '17h',
    text: 'The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex!',
    image: '',
    likes: 2,
    comments: 0,
    shares: 3,
  },
  {
    user: 'Chad',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    time: '17h',
    text: 'The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    likes: 2,
    comments: 0,
    shares: 3,
  },
];

const GroupCrwdUpdates: React.FC = () => (
  <div className="px-4 pt-2 pb-2 ">
    {/* <div className="flex items-center justify-between mb-2 px-2">
      <span className="font-semibold text-base">4 Updates</span>
      <button className="bg-blue-100 text-blue-600 rounded-full p-1"><Plus size={18} /></button>
    </div> */}
    <ProfileActivity
          posts={profileActivity}
        />
  </div>
);

export default GroupCrwdUpdates; 