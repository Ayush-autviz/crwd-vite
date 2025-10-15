import { ArrowRightLeft, Trophy, Users, AtSign } from "lucide-react";
import React from "react";
import { Link } from 'react-router-dom';
import type { NotificationType } from '@/lib/types';

interface NotificationItemProps {
  type: NotificationType;
  avatarUrl?: string;
  username?: string;
  message: string;
  time: string;
  groupName?: string;
  groupAvatar?: string;
  link?: string;
  eventDate?: string;
  eventTitle?: string;
  postContent?: string;
  organizationLogo?: string;
  organizationName?: string;
  onAccept?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  avatarUrl,
  username,
  message,
  time,
  groupName,
  groupAvatar,
  link,
  eventDate,
  eventTitle,
  postContent,
  organizationLogo,
  organizationName,
  onAccept,
}) => {
  return (
    <div className="w-full bg-white grid grid-cols-1 md:grid-cols-1 md:flex-row md:items-center  ">
      {type === "connect" && (
        <div className="flex gap-3  border-t border-gray-200 py-5 px-4  ">
          <div className="col-span-1  flex h-11 w-11  rounded-full justify-center items-start">
            <img
              src={avatarUrl}
              alt={username}
              className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
            />
          </div>
          <div className="col-span-11  flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                @{username}
              </span>
              <span className="text-xs text-gray-400 ">• {time}</span>
            </div>
            <span className="text-gray-700 text-[0.98rem]">{message}</span>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-600 text-white rounded-lg px-10 py-1.5 font-medium text-sm hover:bg-blue-700 transition"
                onClick={onAccept}
              >
                Follow Back
              </button>
            </div>
          </div>
        </div>
      )}
      {type === "donation" && (
        <Link to="/donation" className="w-full">
          <div className="flex gap-3 md:grid-cols-12 border-t border-gray-200 py-4 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="col-span-1 flex justify-center items-center">
              <ArrowRightLeft className="text-gray-700" />
            </div>
            <div className="col-span-11 flex-1 flex flex-col gap-1 justify-center">
              <span className="text-gray-700 ">{message}</span>
              {/* <span className="text-xs text-gray-400">• {time}</span> */}
            </div>
          </div>
        </Link>
      )}
      {type === "post" && (
        <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
          <Link to="/profile" className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
            <img
              src={avatarUrl}
              alt={username}
              className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
            />
          </Link>
          <div className="col-span-11 flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <span className="font-semibold text-gray-900 hover:underline cursor-pointer">
                  @{username}
                </span>
              </Link>
              <span className="text-xs text-gray-400">• {time}</span>
            </div>
            {message && <span className="text-gray-700 text-[0.98rem]">{message}</span>}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Link to="/groupcrwd">
                  <img
                    src={groupAvatar}
                    alt={groupName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>
                <Link to="/groupcrwd">
                  <span className="font-medium text-gray-900 hover:underline cursor-pointer">
                    {groupName}
                  </span>
                </Link>
              </div>
              <Link to={link || "#"} className="block">
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
                    <img
                      src="https://placehold.co/80x80/e6e7eb/818cf8"
                      alt="Link preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-1">Health Article: Latest Research</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      This article discusses the latest research findings on health and wellness, providing valuable insights for community members.
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
      {type === "event" && (
        <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
          <Link to="/profile" className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
            <img
              src={avatarUrl}
              alt={username}
              className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
            />
          </Link>
          <div className="col-span-11 flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <span className="font-semibold text-gray-900 hover:underline cursor-pointer">
                  @{username}
                </span>
              </Link>
              <span className="text-xs text-gray-400">• {time}</span>
            </div>
            {message && <span className="text-gray-700 text-[0.98rem]">{message}</span>}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Link to="/groupcrwd">
                  <img
                    src={groupAvatar}
                    alt={groupName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>
                <Link to="/groupcrwd">
                  <span className="font-medium text-gray-900 hover:underline cursor-pointer">
                    {groupName}
                  </span>
                </Link>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{eventTitle}</span>
                <span className="text-sm text-gray-600">{eventDate}</span>
                <p className="text-sm text-gray-600 mt-2">
                  Join us for this community fundraiser event to support our cause. There will be food, music, and activities for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mention Notification */}
      {type === "mention" && (
        <Link to={`/profile`} className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <div className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
              <img
                src={avatarUrl}
                alt={username}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
              />
            </div>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">@{username}</span>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <span className="text-gray-700 text-[0.98rem]">{message}</span>
            </div>
          </div>
        </Link>
      )}

      {/* Follow Notification */}
      {type === "follow" && (
        <div className="flex gap-3 border-t border-gray-200 py-5 px-4 hover:bg-gray-50 transition-colors">
          <Link to={`/profile/`} className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
            <img
              src={avatarUrl}
              alt={username}
              className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
            />
          </Link>
          <div className="col-span-11 flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${username}`}>
                <span className="font-semibold text-gray-900 hover:underline cursor-pointer">@{username}</span>
              </Link>
              <span className="text-xs text-gray-400">• {time}</span>
            </div>
            <span className="text-gray-700 text-[0.98rem]">{message}</span>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-600 text-white rounded-lg px-6 py-1.5 font-medium text-sm hover:bg-blue-700 transition"
                onClick={onAccept}
              >
                Follow back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Like Notification */}
      {type === "like" && (
        <Link to={`/post/1`} className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <Link to={`/profile/${username}`} className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
              <img
                src={avatarUrl}
                alt={username}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
              />
            </Link>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${username}`}>
                  <span className="font-semibold text-gray-900 hover:underline cursor-pointer">@{username}</span>
                </Link>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <span className="text-gray-700 text-[0.98rem]">{message}</span>
            </div>
          </div>
        </Link>
      )}

      {/* Comment Notification */}
      {type === "comment" && (
        <Link to={`/post/1`} className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <Link to={`/profile/${username}`} className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
              <img
                src={avatarUrl}
                alt={username}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
              />
            </Link>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${username}`}>
                  <span className="font-semibold text-gray-900 hover:underline cursor-pointer">@{username}</span>
                </Link>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <span className="text-gray-700 text-[0.98rem]">{message}</span>
            </div>
          </div>
        </Link>
      )}

      {/* Achievement Notification */}
      {type === "achievement" && (
        <Link to="/donation" className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <div className="col-span-1 flex h-11 w-11 rounded-full justify-center items-center ">
              <Trophy className="h-5 w-5 text-black" />
            </div>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Congratulations!</span>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <span className="text-gray-700 text-[0.98rem]">{message}</span>
            </div>
          </div>
        </Link>
      )}

      {/* CRWD Activity Notification */}
      {type === "crwd_activity" && (
        <Link to="/members" className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <div className="col-span-1 flex h-11 w-11 rounded-full justify-center items-center ">
              <Trophy className="h-5 w-5 text-black" />
            </div>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Congratulations!</span>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <span className="text-gray-700 text-[0.98rem]">{message}</span>
            </div>
          </div>
        </Link>
      )}

      {/* CRWD Join Notification */}
      {type === "crwd_join" && (
        <Link to={`/groupcrwd`} className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <Link to={`/profile/${username}`} className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
              <img
                src={avatarUrl}
                alt={username}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
              />
            </Link>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Link to={`/profile`}>
                  <span className="font-semibold text-gray-900 hover:underline cursor-pointer">@{username}</span>
                </Link>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-700 text-[0.98rem]">{username} joined</span>
                <div className="flex items-center gap-2">
                  <Link to="/groupcrwd">
                    <span className="text-blue-600 font-semibold hover:underline cursor-pointer text-[0.98rem]">
                      {groupName}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Event Attend Notification */}
      {type === "event_attend" && (
        <Link to={`/profile`} className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <Link to={`/post/1`} className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
              <img
                src={avatarUrl}
                alt={username}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
              />
            </Link>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${username}`}>
                  <span className="font-semibold text-gray-900 hover:underline cursor-pointer">@{username}</span>
                </Link>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <span className="text-gray-700 text-[0.98rem]">{message}</span>
            </div>
          </div>
        </Link>
      )}

      {/* Community Post Notification */}
      {type === "community_post" && (
        <Link to={`/groupcrwd`} className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <Link to={`/profile/${username}`} className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
              <img
                src={avatarUrl}
                alt={username}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
              />
            </Link>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div>
                <Link to={`/profile/${username}`}>
                  <span className="font-semibold text-gray-900 hover:underline cursor-pointer">@{username}</span>
                </Link>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className="text-gray-700 text-[0.98rem]">{message.substring(0, 20)}</span>
                <img
                  src="/crwd.svg"
                  alt="CRWD logo"
                  className="w-5 h-5"
                />
                <span className="text-blue-600 font-[600] hover:underline cursor-pointer"> March of Dimes</span>
              </div>
              {postContent && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">{postContent}</p>
                </div>
              )}
            </div>
          </div>
        </Link>
      )}

      {/* Community Event Notification */}
      {type === "community_event" && (
        <Link to={`/profile`} className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <Link to={`/profile/${username}`} className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
              <img
                src={avatarUrl}
                alt={username}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
              />
            </Link>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${username}`}>
                  <span className="font-semibold text-gray-900 hover:underline cursor-pointer">@{username}</span>
                </Link>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <span className="text-gray-700 text-[0.98rem]">{message}</span>
              {eventTitle && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-900">{eventTitle}</span>
                  {eventDate && <span className="text-sm text-gray-600 block">{eventDate}</span>}
                </div>
              )}
            </div>
          </div>
        </Link>
      )}

      {/* Community Donation Notification */}
      {type === "community_donation" && (
        <Link to={`/profile`} className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <Link to={`/profile/${username}`} className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
              <img
                src={avatarUrl}
                alt={username}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
              />
            </Link>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${username}`}>
                  <span className="font-semibold text-gray-900 hover:underline cursor-pointer">@{username}</span>
                </Link>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <span className="text-gray-700 text-[0.98rem]">{message}</span>
              {organizationName && (
                <div className="flex items-center gap-2 mt-2">
                  {organizationLogo && (
                    <img
                      src={organizationLogo}
                      alt={organizationName}
                      className="w-6 h-6 rounded object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-blue-600">{organizationName}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      )}

      {/* Community Interest Notification */}
      {type === "community_interest" && (
        <Link to={`/profile`} className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <Link to={`/profile/${username}`} className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
              <img
                src={avatarUrl}
                alt={username}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
              />
            </Link>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${username}`}>
                  <span className="font-semibold text-gray-900 hover:underline cursor-pointer">@{username}</span>
                </Link>
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <span className="text-gray-700 text-[0.98rem]">{message}</span>
              {eventTitle && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-900">{eventTitle}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      )}

      {/* Community Join Notification */}
      {type === "community_join" && (
        <Link to={`/groupcrwd`} className="block hover:bg-gray-50 transition-colors">
          <div className="flex gap-3 border-t border-gray-200 py-5 px-4">
            <Link to={`/profile/${username}`} className="col-span-1 flex h-11 w-11 rounded-full justify-center items-start">
              <img
                src={avatarUrl}
                alt={username}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100"
              />
            </Link>
            <div className="col-span-11 flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Link to={`/profile`}>
                  <span className="font-semibold text-gray-900 hover:underline cursor-pointer">@{username}</span>
                </Link>
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-gray-400">• {time}</span>
              </div>
              <span className="text-gray-700 text-[0.98rem]">{message}</span>
              {groupName && (
                <Link to={`/groupcrwd`} className="text-blue-600 hover:underline font-medium text-sm mt-1 inline-block">
                  {groupName}
                </Link>
              )}
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default NotificationItem;
