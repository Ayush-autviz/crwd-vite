import { useState } from "react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Articles = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy articles data
  const articles = [
    {
      id: 1,
      title: "How to Start Your First CRWD Collective",
      excerpt: "Everything you need to know about creating a collective and bringing together like-minded people to support causes you care about.",
      author: "CRWD Team",
      readTime: "5 min read",
      category: "Collectives",
      publishedDate: "2 days ago",
      featured: true,
    },
    {
      id: 2,
      title: "Supporting Causes That Matter: A Beginner's Guide",
      excerpt: "Learn how to find, evaluate, and support causes that align with your values and create real impact in your community.",
      author: "Alex Thompson",
      readTime: "7 min read",
      category: "Causes",
      publishedDate: "1 week ago",
      featured: false,
    },
    {
      id: 3,
      title: "Making the Most of Your Donation Box",
      excerpt: "Tips and strategies for organizing your giving and tracking your impact through CRWD's donation features.",
      author: "Maria Garcia",
      readTime: "6 min read",
      category: "Donations",
      publishedDate: "1 week ago",
      featured: false,
    },
    {
      id: 4,
      title: "Building Community Through Collective Action",
      excerpt: "Discover how joining CRWD collectives helps you connect with others and amplify your social impact together.",
      author: "James Chen",
      readTime: "8 min read",
      category: "Community",
      publishedDate: "2 weeks ago",
      featured: false,
    },
    {
      id: 5,
      title: "Finding Causes Near You: Local Impact Matters",
      excerpt: "How to discover and support causes in your area, and why local giving creates the most lasting change.",
      author: "Sarah Williams",
      readTime: "4 min read",
      category: "Local Impact",
      publishedDate: "3 weeks ago",
      featured: false,
    },
    {
      id: 6,
      title: "The Future of Collective Giving with CRWD",
      excerpt: "Understanding how CRWD is revolutionizing the way people come together to support causes and create positive change.",
      author: "CRWD Team",
      readTime: "9 min read",
      category: "Platform",
      publishedDate: "1 month ago",
      featured: false,
    },
  ];

  const featuredArticles = articles.filter(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  const filteredArticles = searchQuery
    ? articles.filter(
        article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      <ProfileNavbar 
        title="Articles" 
        showBackButton={true}
        showMobileMenu={true}
        showDesktopMenu={true}
      />

      <div className="pb-16 md:pb-0">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1.5 md:mb-2">
              CRWD Articles
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Learn how to make a difference through collectives, causes, and community giving
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 md:mb-8">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 md:pl-12 pr-3 md:pr-4 py-2 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 text-sm md:text-base"
              />
            </div>
          </div>

          {/* Content */}
          {searchQuery ? (
            /* Search Results */
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-foreground">
                  Search Results ({filteredArticles.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-xs md:text-sm"
                >
                  Clear
                </Button>
              </div>
              
              {filteredArticles.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {filteredArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardHeader className="p-4 md:p-6">
                        <div className="flex items-start justify-between gap-3 md:gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 flex-wrap">
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-600 text-xs"
                              >
                                {article.category}
                              </Badge>
                              {article.featured && (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-600 text-xs"
                                >
                                  <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1.5 md:mb-2">
                              {article.title}
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground">
                              {article.excerpt}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 md:p-6 pt-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-2 md:gap-4">
                            <span>By {article.author}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span>{article.readTime}</span>
                            </div>
                            <span>{article.publishedDate}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                            Read More <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-0.5 md:ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
                  <p className="text-sm md:text-base text-muted-foreground">No articles found matching your search</p>
                </div>
              )}
            </div>
          ) : (
            /* Normal View */
            <div className="space-y-6 md:space-y-8">
              {/* Featured Article */}
              {featuredArticles.length > 0 && (
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                    Featured Article
                  </h2>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 flex-wrap">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-xs">
                          {featuredArticles[0].category}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-600 text-xs">
                          Featured
                        </Badge>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1.5 md:mb-2">
                        {featuredArticles[0].title}
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground">
                        {featuredArticles[0].excerpt}
                      </p>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                          <span>By {featuredArticles[0].author}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>{featuredArticles[0].readTime}</span>
                          </div>
                          <span>{featuredArticles[0].publishedDate}</span>
                        </div>
                        <Button size="sm" className="gap-1.5 md:gap-2 text-xs md:text-sm">
                          Read Article <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* All Articles */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                  All Articles
                </h2>
                <div className="space-y-3 md:space-y-4">
                  {regularArticles.map((article) => (
                    <Card
                      key={ article.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardHeader className="p-4 md:p-6">
                        <div className="flex items-start justify-between gap-3 md:gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-xs">
                                {article.category}
                              </Badge>
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1.5 md:mb-2">
                              {article.title}
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground">
                              {article.excerpt}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 md:p-6 pt-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-2 md:gap-4">
                            <span>By {article.author}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span>{article.readTime}</span>
                            </div>
                            <span>{article.publishedDate}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                            Read More <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-0.5 md:ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Articles;
