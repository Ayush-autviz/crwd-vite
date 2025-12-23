import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

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
      image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&h=600&fit=crop",
    },
    {
      id: 2,
      title: "Why Small Donations Matter",
      description: "Every contribution counts toward lasting change",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1733809701005-0b1c0ad53c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb25hdGlvbiUyMGltcGFjdCUyMGNoYXJpdHl8ZW58MXx8fHwxNzYxODAzMDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 3,
      title: "What is a CRWD Collective?",
      description: "Learn how collectives amplify your giving power",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1758599668125-e154250f24bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXJzJTIwaGVscGluZyUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjE3NTE1NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const displayArticles = articles && articles.length > 0 ? articles : defaultArticles;

  return (
    <div className="bg-card py-10 md:py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Title and Link */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h2 className="font-[800] text-foreground" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            Learn & Get Inspired
          </h2>
          {/* <Link
            to={seeAllLink} */}
            <a href={seeAllLink}
            className="text-[#1600ff] font-[600] hover:underline flex items-center gap-1 text-base md:text-lg"
          >
            All articles <span>→</span>
            </a>
          {/* </Link> */}
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {displayArticles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
            >
              <div className="p-0">
                {/* Article Image */}
                <div className="w-full h-48 md:h-56 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Article Content */}
                <div className="p-4 md:p-6">
                  {/* Read Time */}
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {article.readTime}
                    </p>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-2">
                    {article.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

