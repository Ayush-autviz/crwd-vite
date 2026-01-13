import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

interface Article {
  id: string | number;
  title: string;
  description: string;
  readTime: string;
  image: string;
  slug?: string;
}

interface LearnAndGetInspiredProps {
  articles?: Article[];
  seeAllLink?: string;
}

export default function LearnAndGetInspired({
  articles,
  seeAllLink = "/articles",
}: LearnAndGetInspiredProps) {
  // Default articles data if none provided
  const defaultArticles: Article[] = [
    {
      id: 1,
      title: "How to donate to multiple charities at once",
      description: "Learn how CRWD's donation box makes it easy to support all your favorite causes",
      readTime: "5 min read",
      image: "/learn/learn4.jpeg",
      slug: "how-to-donate-to-multiple-charities-at-once",
    },
    {
      id: 2,
      title: "Why Small Donations Matter",
      description: "Every contribution counts toward lasting change",
      readTime: "4 min read",
      image: "/learn/learn1.jpeg",
      slug: "why-small-donations-matter",
    },
    {
      id: 3,
      title: "What is a CRWD Collective?",
      description: "Learn how collectives amplify your giving power",
      readTime: "5 min read",
      image: "/learn/learn3.jpeg",
      slug: "what-is-a-crwd-collective",
    },
  ];

  const displayArticles = articles && articles.length > 0 ? articles : defaultArticles;

  return (
    <div className="bg-card py-6 md:py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Title and Link */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-8 gap-3 md:gap-4">
          <h2 className="font-[800] text-foreground text-2xl xs:text-3xl md:text-2xl" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            Learn & Get Inspired
          </h2>
          {/* <Link
            to={seeAllLink} */}
          {/* <a href={seeAllLink}
            className="text-[#1600ff] font-[600] hover:underline flex items-center gap-1 text-xs md:text-lg"
          >
            All articles <span>→</span>
            </a> */}
          {/* </Link> */}
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {displayArticles.map((article) => {
            const articleSlug = article.slug || generateSlug(article.title);
            return (
              <Link
                key={article.id}
                to={`/article/${articleSlug}`}
                className="rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
              >
                <div className="p-0">
                  {/* Article Image */}
                  <div className="w-full h-36 md:h-56 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Article Content */}
                  <div className="p-3 md:p-6">
                    {/* Read Time */}
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                      <p className="text-xs xs:text-sm md:text-sm text-muted-foreground">
                        {article.readTime}
                      </p>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-base xs:text-lg md:text-xl text-foreground mb-1.5 md:mb-2 line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm xs:text-base md:text-base text-muted-foreground leading-relaxed line-clamp-2">
                      {article.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

