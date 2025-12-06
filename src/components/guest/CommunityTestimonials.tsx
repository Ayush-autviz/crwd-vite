import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/api/social";
import PopularPosts from "@/components/PopularPosts";

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

  // Limit posts to the specified number
  const limitedPosts = postsData
    ? {
        ...postsData,
        results: postsData.results?.slice(0, limit) || [],
      }
    : undefined;

  return (
    <div className="bg-gray-50 py-10 md:py-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2 className="font-[800] text-foreground mb-6 md:mb-8 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          What Our Community Is Saying
        </h2>

        {/* Use PopularPosts component */}
        <PopularPosts
          posts={limitedPosts}
          isLoading={isLoading}
          title="no title"
          showLoadMore={false}
        />
      </div>
    </div>
  );
}

