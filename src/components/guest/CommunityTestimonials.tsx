import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/api/social";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface CommunityTestimonialsProps {
  limit?: number;
}

export default function CommunityTestimonials({
  limit = 3,
}: CommunityTestimonialsProps) {

  const navigate = useNavigate();
  // Fetch posts data using React Query
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["community-testimonials"],
    queryFn: () => getPosts("", "", 1),
    enabled: true,
    retry: false,
  });

  // Get user initials
  const getInitials = (user: any) => {
    // if (user?.first_name && user?.last_name) {
    //   return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    // }
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get user display name
  const getUserName = (user: any) => {
    // if (user?.first_name && user?.last_name) {
    //   return `${user.first_name} ${user.last_name.charAt(0)}.`;
    // }
    if (user?.first_name) {
      return user.first_name;
    }
    if (user?.username) {
      return user.username;
    }
    return "User";
  };

  // Get avatar color based on user/collective - variety of colors
  const getAvatarColor = (index: number, userId?: number) => {
    const colors = [
      { bg: '#0000FF', name: 'blue' },      // Blue
      { bg: '#FF3366', name: 'pink' },     // Pink/Red
      { bg: '#A855F7', name: 'purple' },   // Purple
      { bg: '#10B981', name: 'green' },    // Green
      { bg: '#F59E0B', name: 'amber' },    // Amber/Orange
      { bg: '#EC4899', name: 'rose' },     // Rose
      { bg: '#3B82F6', name: 'light-blue' }, // Light Blue
      { bg: '#8B5CF6', name: 'violet' },   // Violet
      { bg: '#14B8A6', name: 'teal' },     // Teal
      { bg: '#F97316', name: 'orange' },   // Orange
      { bg: '#EF4444', name: 'red' },      // Red
      { bg: '#6366F1', name: 'indigo' },   // Indigo
    ];
    // Use index or userId to determine color
    const colorIndex = userId ? (userId % colors.length) : (index % colors.length);
    return colors[colorIndex];
  };

  // Limit posts to the specified number
  const posts = postsData?.results?.slice(0, limit) || [];

  // Don't render anything if no posts are available (after loading)
  if (!isLoading && posts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 py-6 md:py-12 lg:py-16 xl:py-20 px-4 md:px-6 lg:px-8 xl:px-10">
      <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="font-[800] text-foreground mb-4 md:mb-8 lg:mb-10 xl:mb-12 text-center text-2xl xs:text-3xl md:text-3xl" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
          What Our Community Is Saying
        </h2>

        {/* Posts List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8 md:py-12 lg:py-16 xl:py-20">
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 animate-spin text-gray-400" />
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-3 md:gap-5 lg:gap-6 xl:gap-8 max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
            {posts.map((post: any, index: number) => {
              const avatarColor = getAvatarColor(index, post.user?.id);
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-lg p-3 md:p-5 lg:p-6 xl:p-8 shadow-sm"
                >
                  {/* User Info */}
                  <div className="flex items-start gap-2 md:gap-4 lg:gap-5 mb-2 md:mb-4 lg:mb-5">
                    <Avatar className="h-8 w-8 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 flex-shrink-0">
                      <AvatarImage src={post.user?.profile_picture} />
                      <AvatarFallback
                        className="text-white font-semibold text-[10px] md:text-sm lg:text-base xl:text-lg"
                        style={{ backgroundColor: post.user?.color }}
                      >
                        {getInitials(post.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm xs:text-base md:text-base lg:text-lg xl:text-xl mb-0.5 md:mb-1">
                        {getUserName(post.user)}
                      </h3>
                      {post.collective?.name && (
                        <p className="text-[#1600ff] text-sm xs:text-base md:text-base lg:text-lg xl:text-xl font-medium">
                          {post.collective.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <p onClick={() => navigate(`/post/${post.id}`)} className="cursor-pointer text-gray-900 text-sm xs:text-base md:text-base lg:text-lg xl:text-xl mb-3 md:mb-5 lg:mb-6 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Engagement Metrics */}
                  <div className="flex items-center gap-3 md:gap-5 lg:gap-6 xl:gap-8 pt-2 md:pt-4 lg:pt-5">
                    <div className="flex items-center gap-1 md:gap-2 lg:gap-2.5">
                      <Heart className="h-3.5 w-3.5 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-gray-600" />
                      <span className="text-gray-900 text-xs md:text-base lg:text-lg xl:text-xl font-medium">
                        {post.likes_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 lg:gap-2.5">
                      <MessageCircle className="h-3.5 w-3.5 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-gray-600" />
                      <span className="text-gray-900 text-xs md:text-base lg:text-lg xl:text-xl font-medium">
                        {post.comments_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

