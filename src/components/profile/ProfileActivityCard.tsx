"use client"
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { CardContent } from '../ui/card'
import { Card } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { EllipsisIcon, Trash2, Flag } from 'lucide-react'
import type { PostDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom';
import { IoArrowRedoOutline } from "react-icons/io5";

export default function ProfileActivityCard({ post, className }: { post: PostDetail, className?: string }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (

    <Card key={post.id} className={cn("overflow-hidden border-0 shadow-sm lg:max-w-[600px] ", className)}>
      <CardContent className="">
        <Link to={`/posts/${post.id}`} className='w-full'>
          <div className="flex gap-3 ">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={post.avatarUrl} alt={post.username} />
              <AvatarFallback>{post.username.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{post.username}</span>
                  <span className="text-xs text-muted-foreground ml-2">• {post.time}</span>
                </div>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <EllipsisIcon className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-36">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMenu(false);
                          // Handle delete post
                          console.log('Delete post');
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Post
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMenu(false);
                          // Handle report post
                          console.log('Report post');
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Flag className="h-4 w-4" />
                        Report Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Link to='/groupcrwd'>
                <div className="text-xs text-primary hover:underline">{post.org}</div>
              </Link>

              <div className="text-sm mt-2 mb-3 whitespace-pre-line leading-snug">
                {post.text}
              </div>

              {post.imageUrl && (
                <div className="w-full h-48 rounded-lg overflow-hidden mb-3">
                  <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center gap-4 text-muted-foreground mt-2">
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">{post.comments}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors ml-auto">
                  <IoArrowRedoOutline className="w-4 h-4" />
                  <span className="text-xs">{post.shares}</span>
                </button>
              </div>
            </div>

          </div>
        </Link>

      </CardContent>
    </Card>
    // </Link>
  )
}
