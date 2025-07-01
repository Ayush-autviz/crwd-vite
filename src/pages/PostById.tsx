import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PostDetailHeader from '@/components/post/PostDetailHeader';
import { popularPosts, profileActivity } from '@/lib/profile/profileActivity';
import ProfileActivityCard from '@/components/profile/ProfileActivityCard';
import { X } from 'lucide-react';

export default function PostById() {
  const { id } = useParams();
  const [inputValue, setInputValue] = useState('');
  const allPosts = [...popularPosts, ...profileActivity];
  const post = allPosts.find((post) => post.id === parseInt(id || '0'));

  const clearInput = () => {
    setInputValue('');
  };

  if (!post) {
    return (
      <div className="bg-white min-h-screen flex flex-col relative pb-16">
        <PostDetailHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Post not found</h2>
            <p className="text-gray-600">The post you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col relative pb-16">
      <PostDetailHeader />
      <main className="flex-1">
        <ProfileActivityCard post={post} className="rounded-none shadow-none border-b border-gray-200" />

        {/* Status Row */}
        {post.comments !== 0 && (
          <>
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <img src={post.avatarUrl} alt={post.username} className="w-6 h-6 rounded-full border" />
          <span className="text-sm text-gray-700 font-medium">@{post.username}</span>
          <span className="text-sm text-gray-500">is going</span>
        </div>


        <div className="flex items-start gap-3 px-4 py-4 border-b">
          <img src={post.avatarUrl} alt={post.username} className="w-7 h-7 rounded-full border mt-1" />
          <div>
            <span className="font-semibold text-sm text-gray-800">@{post.username}</span>
            <p className="text-sm text-gray-700 leading-snug mt-1">{post.text}</p>
          </div>
        </div>
        </> 
        )}

        {/* Comments Section */}
        <div className="px-4 py-6">
          {post.comments === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Be the first one to comment</h3>
                <p className="text-sm text-gray-500">Share your thoughts and start the conversation</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sample comments would go here */}
              <p className="text-sm text-gray-600 font-medium">{post.comments} comment{post.comments !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>

        {/* Spacer for sticky input */}
        <div className="h-30" />
      </main>

      {/* Sticky Input Bar */}
      <div className="fixed bottom-25 md:bottom-0 right-0 bg-white border-t px-4 py-3 flex items-center gap-2 w-full md:w-[calc(100%-288px)] ">
        <div className="flex items-center gap-2 flex-1 bg-gray-100 rounded-full px-4 py-2 relative">
          <img src={post.avatarUrl} alt={post.username} className="w-5 h-5 rounded-full border" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Join the conversation"
            className="bg-transparent outline-none flex-1 text-sm text-gray-700 placeholder-gray-400 pr-6"
          />
          {inputValue && (
            <button
              onClick={clearInput}
              className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
