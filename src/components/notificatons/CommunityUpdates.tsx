import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Heart, MessageCircle, EllipsisIcon } from 'lucide-react';
import { IoArrowRedoOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';

// Community Posts that will appear as full posts
const communityPosts = [
  // {
  //   id: 1,
  //   avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
  //   username: 'conrad',
  //   time: '19h',
  //   org: null,
  //   text: '@conrad joined Healthiswealth',
  //   imageUrl: null,
  //   likes: 0,
  //   comments: 0,
  //   shares: 0,
  //   isJoin: true,
  //   groupName: 'Healthiswealth'
  // },
  {
    id: 2,
    avatarUrl: 'https://randomuser.me/api/portraits/women/32.jpg',
    username: 'mynameismya',
    time: '17h',
    org: 'feedthehungry',
    text: 'The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex!',
    imageUrl: null,
    likes: 2,
    comments: 0,
    shares: 3,
  },
  {
    id: 3,
    avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
    username: 'conrad',
    time: '4h',
    org: null,
    text: 'donated to',
    imageUrl: null,
    likes: 0,
    comments: 0,
    shares: 0,
    isDonation: true,
    donatedTo: 'The Red Cross',
    organizationName: 'The Red Cross',
    organizationLogo: '/redcross.png'
  },
  {
    id: 4,
    avatarUrl: 'https://randomuser.me/api/portraits/women/25.jpg',
    username: 'emma_321',
    time: '1d',
    org: 'larelief',
    text: 'The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk',
    link: 'www.thisisaurl.com',
    imageUrl: 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?auto=format&fit=crop&w=600&q=80',
    likes: 2,
    comments: 0,
    shares: 3,
    linkPreview: {
      title: 'The LA wildfires have depleted local resources',
      description: 'The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk'
    }
  },
  {
    id: 5,
    avatarUrl: 'https://randomuser.me/api/portraits/women/30.jpg',
    username: 'rachelwilson',
    time: '3d',
    org: 'foodforall',
    text: 'Join us this saturday!',
    imageUrl: null,
    likes: 2,
    comments: 0,
    shares: 3,
    isEvent: true,
    eventDetails: {
      date: '3/8/2025',
      time: '7:00 am',
      rsvp: '8',
      maybe: '17',
      place: '123 Main St. Somewhere, USA'
    }
  },
];

const CommunityUpdates: React.FC = () => {

  const [open, setOpen] = useState(false);


  return (
    <div className="w-full flex flex-col">

      {/* Auth Modal */}
      <AuthModal open={open} onOpenChange={setOpen} />

      {/* Community Posts */}
      <div className="space-y-0">
        {communityPosts.map((post:any) => (
          <Card key={post.id} className="overflow-hidden border-0 shadow-none rounded-none border-b border-gray-200 bg-white">
            <CardContent className="">
              {/* <Link to={`/posts/${post.id}`} className='w-full'> */}
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={post.avatarUrl} alt={post.username} />
                    <AvatarFallback>{post.username.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    { !post.isDonation && (
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm text-gray-900">{post.username}</span>
                      <span className="text-xs text-gray-400">• {post.time}</span>
                    </div>
                    <EllipsisIcon className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </div>
                    )
                    }

                    
                    {post.org && (
                      <Link to={`/groupcrwd`}>
                      <div className="text-xs text-blue-600 hover:underline cursor-pointer">{post.org}</div>
                      </Link>
                    )}

                    <div className="text-[0.98rem] mt-2 mb-3 text-gray-700 leading-snug">
                      {post.isDonation ? (
                        <div className="flex items-center gap-1">
                          <span className=" font-semibold  text-gray-900">@{post.username}</span>
                          <span>{post.text}</span>
                          {post.donatedTo && (
                            <>
                            <span className="text-blue-500 font-semibold">{post.donatedTo}</span>
                            <span className="text-xs text-gray-400">• {post.time}</span>
                            </>
                          )}
                        </div>
                      ) : post.isJoin ? (
                        <div className="flex items-center gap-2">
                          <span>{post.text}</span>
                          <span className="text-blue-600 ">{post.groupName}</span>
                        </div>
                      ) : (
                        <div>
                          <div>{post.text}</div>
                          {post.link && (
                            <div className="text-blue-600 hover:underline mt-1">
                              {post.link}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {post.imageUrl && (
                      <div className="w-full h-48 rounded-lg overflow-hidden mb-3 lg:max-w-[600px]">
                        <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {post.linkPreview && (
                      <div className="border border-gray-200 rounded-lg p-3 mb-3">
                        <h3 className="font-semibold text-gray-900 text-[0.98rem] mb-1">
                          {post.linkPreview.title}
                        </h3>
                        <p className="text-[0.98rem] text-gray-600">
                          {post.linkPreview.description}
                        </p>
                      </div>
                    )}

                    {post.isEvent && post.eventDetails && (
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-4 text-[0.98rem]">
                          <div>
                            <span className="font-semibold text-gray-900">Date</span>
                            <span className="text-gray-600 ml-1">{post.eventDetails.date}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Time</span>
                            <span className="text-gray-600 ml-1">{post.eventDetails.time}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">RSVP</span>
                            <span className="text-gray-600 ml-1">{post.eventDetails.rsvp}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Maybe</span>
                            <span className="text-gray-600 ml-1">{post.eventDetails.maybe}</span>
                          </div>
                        </div>
                        <div className="text-[0.98rem]">
                          <span className="font-semibold text-gray-900">Place</span>
                          <span className="text-gray-600 ml-1">{post.eventDetails.place}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-muted-foreground mt-2">
                      <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" onClick={() => setOpen(true)} />
                        <span className="text-xs">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors ml-auto">
                        <IoArrowRedoOutline className="w-4 h-4" />
                        <span className="text-xs">{post.shares}</span>
                      </button>
                    </div>
                  </div>
                </div>
              {/* </Link> */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityUpdates; 