import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/api/social";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommunityTestimonialsProps {
  limit?: number;
}

export default function CommunityTestimonials({
  limit = 3,
}: CommunityTestimonialsProps) {
  // Fetch posts data using React Query
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["community-testimonials"],
    queryFn: () => getPosts("", "", 1),
    enabled: true,
    retry: false,
  });

  // Get user initials
  const getInitials = (user: any) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
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
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name.charAt(0)}.`;
    }
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

  return (
    <div className="bg-gray-50 py-10 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2 className="font-[800] text-foreground mb-6 md:mb-8 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
          What Our Community Is Saying
        </h2>

        {/* Posts List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {posts.map((post: any, index: number) => {
              const avatarColor = getAvatarColor(index, post.user?.id);
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  {/* User Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={post.user?.profile_picture} />
                      <AvatarFallback 
                        className="text-white font-semibold"
                        style={{ backgroundColor: avatarColor.bg }}
                      >
                        {getInitials(post.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm mb-0.5">
                        {getUserName(post.user)}
                      </h3>
                      {post.collective?.name && (
                        <p className="text-[#1600ff] text-sm font-medium">
                          {post.collective.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-900 text-sm mb-4 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Engagement Metrics */}
                  <div className="flex items-center gap-4 pt-3 ">
                    <div className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900 text-sm font-medium">
                        {post.likes_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900 text-sm font-medium">
                        {post.comments_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No posts available yet
          </div>
        )}
      </div>
    </div>
  );
}

