import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lightbulb, Check, TrendingUp, Calendar, Target, Building2, Droplet, BookOpen, UtensilsCrossed, Stethoscope, BarChart3, Clock, Hand, Users, Zap, Gem } from "lucide-react";
// import Footer from "@/components/Footer";

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const ArticleDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  // Get article data based on slug
  const getArticleData = (articleSlug: string | undefined) => {
    const articles: Record<string, any> = {
      "how-to-donate-to-multiple-charities-at-once": {
        id: "1",
        slug: "how-to-donate-to-multiple-charities-at-once",
        title: "How to Donate to Multiple Charities at Once",
        date: "November 9, 2025",
        readTime: "8 min read",
        author: "CRWD Team",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
        type: "multiple-charities",
        content: {
          introduction: `You care about clean water, education, climate action, animal welfare, and mental health support. Here's the truth most people face: **You care about everything, but you give to nothing.**`,
          introText: `Managing multiple donations is complicated. Different websites, multiple charges, scattered tax receipts.`,
          introConclusion: `There are five ways to support multiple charities with less hassle.`,
          ways: [
            {
              title: "Individual Recurring Donations",
              description: "Set up monthly donations on each nonprofit's website.",
              goodFor: "2-3 charities maximum",
              downside: "Multiple charges and administrative work",
            },
            {
              title: "Donor-Advised Funds (DAFs)",
              description: "Contribute to a fund for tax deductions and grant over time.",
              goodFor: "Donors giving $5,000+ annually",
              downside: "High minimums and complexity",
            },
            {
              title: "Giving Circles",
              description: "Pool money with friends.",
              goodFor: "People who enjoy group decision-making",
              downside: "Requires meetings and coordination",
            },
            {
              title: "Workplace Giving",
              description: "Split donations through payroll.",
              goodFor: "Employees at companies with matching programs",
              downside: "Limited to approved charity lists",
            },
            {
              title: "Multi-Charity Platforms",
              description: "Set one monthly donation that automatically splits across chosen nonprofits. Platforms like CRWD.",
              goodFor: "Anyone supporting 3+ charities",
              downside: "Small platform fees (usually 5-10%)",
              highlight: true,
              highlightText: "Why this works best for most people: One donation, unlimited causes, minimal hassle. Add or remove charities anytime.",
            },
          ],
          recurringSection: {
            title: "Why Recurring Donations Work Better",
            statement: "Small, consistent donations beat large, sporadic ones.",
            math: [
              "→ One-time $100 donation = $100 to one cause",
              "→ $20/month across 5 charities = $240/year supporting five causes",
            ],
          },
        },
      },
      "why-small-donations-matter": {
        id: "2",
        slug: "why-small-donations-matter",
        title: "Why Small Donations Matter",
        date: "November 10, 2025",
        readTime: "4 min read",
        author: "CRWD Team",
        image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=400&fit=crop",
        type: "small-donations",
        content: {
          quote: `"$5 won't make a difference."`,
          introduction: `That's what most people think. But here's the truth: small donations aren't just nice gestures—they're the **lifeblood** of nonprofit work. Every dollar counts, and when you give consistently, even small amounts become **essential** to organizations making real change.`,
          introText: `The misconception that only large donations matter keeps countless people from giving at all. But the reality is different. Small, recurring donations often provide more value to nonprofits than sporadic large gifts because they offer predictability and sustainability.`,
          impactSection: {
            title: "The Real Impact of Small Donations",
            intro: "Let's put actual numbers to what small donations can do:",
            cards: [
              {
                icon: Droplet,
                iconColor: "text-blue-600",
                bgColor: "bg-pink-100",
                amount: "$5/month",
                description: "Provides clean water access for one person for an entire year.",
              },
              {
                icon: UtensilsCrossed,
                iconColor: "text-gray-700",
                bgColor: "bg-green-100",
                amount: "$10/month",
                description: "Feeds a family of four for a week through food banks.",
              },
              {
                icon: BookOpen,
                iconColor: "text-green-600",
                bgColor: "bg-pink-100",
                amount: "$15/month",
                description: "Supplies school materials for three children in need.",
              },
              {
                icon: Stethoscope,
                iconColor: "text-red-600",
                bgColor: "bg-green-100",
                amount: "$25/month",
                description: "Covers basic medical care for two people in underserved communities.",
              },
            ],
            conclusion: `These aren't theoretical numbers. They're real outcomes from real organizations doing real work. Your small donation isn't a **drop in the ocean**—it's a **ripple that creates waves**.`,
          },
          powerOfMany: {
            title: "The Power of Many",
            intro: "Here's where small donations become transformative: When you combine them with others.",
            gradientBox: {
              title: "The Math of Collective Impact:",
              calculations: [
                "100 people x $10/month = $12,000/year",
                "1,000 people x $10/month = $120,000/year",
                "10,000 people x $10/month = $1.2 million/year",
              ],
            },
            conclusion: `That's the power of collective giving. Your $10 doesn't stand alone—it joins thousands of other $10 donations to fund entire programs, build infrastructure, and create lasting change.`,
          },
          nonprofitsPrefer: {
            title: "Why Nonprofits Prefer Small Recurring Donors",
            intro: "You might think nonprofits only care about big donors. The truth is more surprising.",
            box: {
              title: "What nonprofits told us:",
              items: [
                {
                  icon: Target,
                  text: "Predictable revenue: Recurring small donations let nonprofits plan programs months in advance",
                },
                {
                  icon: BarChart3,
                  text: "Lower dependence: 1,000 small donors are more sustainable than 10 large donors",
                },
                {
                  icon: Hand,
                  text: "Community building: Small donors often become advocates and volunteers",
                },
                {
                  icon: Clock,
                  text: "Long-term value: A $10/month donor over 5 years = $600 in impact",
                },
              ],
            },
          },
          affordIt: {
            title: `"But I Can Barely Afford It Myself"`,
            intro: `This is the most common objection, and it's completely valid. Financial security comes first. But research shows that people who give—even small amounts—report higher life satisfaction and sense of purpose.`,
            intro2: `Giving doesn't have to mean sacrifice. It can mean redirecting existing spending toward causes you care about.`,
            coffeeTest: {
              title: "The coffee test:",
              text: `If you buy one coffee per week at $5, that's $20/month. Redirecting just one coffee to charity means you can support causes you care about without changing your budget.`,
            },
            conclusion: `You don't have to sacrifice your financial security to make a difference. Start with what feels comfortable—even $5/month matters.`,
          },
          becomingPhilanthropist: {
            title: "Becoming a Philanthropist",
            intro: `The word "philanthropist" sounds fancy. It conjures images of wealthy people writing six-figure checks.`,
            greyBox: {
              text1: `But the word literally means **"lover of humanity."**`,
              text2: `If you give $10/month to help others, you are a philanthropist.`,
            },
            identityShift: `That identity shift matters. When you see yourself as someone who gives, you start making choices aligned with that identity. You talk about causes you support. You inspire friends and family. Your small donation becomes a catalyst for broader change.`,
            startSmall: {
              title: "Start Small, Think Big",
              question: "Ready to become a small donor who makes a big impact?",
              tips: [
                {
                  number: 1,
                  color: "bg-blue-600",
                  title: "Pick an amount that won't stress you",
                  description: "It's better to give $5 consistently than $50 once and never again.",
                },
                {
                  number: 2,
                  color: "bg-purple-600",
                  title: "Choose causes that resonate with you",
                  description: "You'll stick with giving when it's connected to your values.",
                },
                {
                  number: 3,
                  color: "bg-red-600",
                  title: "Make it automatic",
                  description: "Set up recurring donations so you don't have to think about it each month.",
                },
                {
                  number: 4,
                  color: "bg-green-600",
                  title: "Tell others about it",
                  description: "Your example might inspire someone else to start giving too.",
                },
              ],
            },
            smallDonationMatters: {
              title: "Your Small Donation Matters",
              text1: `Every movement starts with individuals making small choices. Climate action, civil rights, public health—all of these began with people contributing what they could, when they could.`,
              text2: `Your $5, $10, or $25 per month isn't just a donation. It's a declaration that you show up for the world you want to see.`,
              buttonText: "Start Giving Today",
            },
          },
        },
      },
      "what-is-a-crwd-collective": {
        id: "3",
        slug: "what-is-a-crwd-collective",
        title: "What is a CRWD Collective?",
        date: "November 11, 2025",
        readTime: "5 min read",
        author: "CRWD Team",
        image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=400&fit=crop",
        type: "collective",
        content: {
          intro: {
            text1: `Imagine having the giving power of 100 people—without spending more than you already planned to donate.`,
            text2: `That's the magic of a CRWD Collective.`,
            text3: `A Collective is a group of people who pool their monthly donations together to support multiple nonprofits at once. Think of it as a giving circle, but automated, transparent, and built for the way modern donors want to make impact.`,
          },
          howItWorks: {
            title: "How Collectives Work",
            intro: `Every Collective on CRWD is built around a shared purpose—whether that's protecting the ocean, advancing education, supporting mental health, or any cause that matters to you.`,
            steps: [
              {
                number: 1,
                color: "bg-blue-600",
                title: "Join (or create) a Collective",
                description: "Browse Collectives by cause, join one that aligns with your values, or create your own around a cause you care about.",
              },
              {
                number: 2,
                color: "bg-purple-600",
                title: "Set your monthly amount",
                description: "Choose what you can afford—$5, $10, $25, or more. Your donation gets split evenly among the Collective's nonprofits.",
              },
              {
                number: 3,
                color: "bg-red-600",
                title: "Watch the impact grow",
                description: "As more people join your Collective, you'll see the total monthly giving grow—and you're part of that collective power.",
              },
            ],
          },
          realExample: {
            title: "A Real Example",
            intro: `Let's say you care about ocean conservation. You join the "Team Ocean Cleanup" Collective.`,
            example: {
              yourDonation: "$10/month",
              members: "150 people",
              collectiveImpact: "$1,500/month",
              yearlyImpact: "$18,000 per year going to ocean conservation",
              detail: "The Collective supports 5 verified ocean nonprofits, so each organization receives $300/month from your group alone.",
            },
            conclusion: `Your $10 didn't just help one nonprofit—it helped five. And you didn't just donate alone—you donated as part of a movement of 150 people who care about the same thing you do.`,
          },
          whyJoin: {
            title: "Why Join a Collective Instead of Donating Solo?",
            intro: `You could absolutely donate on your own. But here's what you get when you join a Collective:`,
            benefits: [
              {
                icon: Target,
                iconColor: "text-red-600",
                bgColor: "bg-red-50",
                title: "Curated nonprofits",
                description: "Every Collective selects high-impact nonprofits, so you don't have to do hours of research. The vetting is done for you.",
              },
              {
                icon: Users,
                iconColor: "text-purple-600",
                bgColor: "bg-purple-50",
                title: "Community & belonging",
                description: "Connect with like-minded people who share your values. Celebrate wins, share stories, and inspire each other to keep giving.",
              },
              {
                icon: TrendingUp,
                iconColor: "text-red-600",
                bgColor: "bg-red-50",
                title: "Amplified impact",
                description: "Your donation becomes part of a larger pool, which means nonprofits receive more predictable, sustainable funding.",
              },
              {
                icon: Zap,
                iconColor: "text-yellow-600",
                bgColor: "bg-yellow-50",
                title: "Effortless giving",
                description: "Set it and forget it. Your monthly donation happens automatically, and you can adjust or cancel anytime.",
              },
            ],
          },
          createOwn: {
            title: "Can I Create My Own Collective?",
            answer: `Absolutely! Creating a Collective takes just a few minutes.`,
            box: {
              title: "When you create a Collective, you:",
              items: [
                "Choose the cause or theme (e.g., \"Climate Action,\" \"Animal Welfare,\" \"Mental Health Support\")",
                "Select up to 5 nonprofits to support (you can add more as your Collective grows)",
                "Share with friends, family, and like-minded people to join",
                "Watch your Collective grow as more people discover and join it",
              ],
            },
            conclusion: `Creating a Collective is perfect if you have a specific cause you're passionate about or if you want to rally your community around shared values. Plus, as the founder, you get to shape the mission and watch the impact grow.`,
          },
          transparency: {
            title: "Complete Transparency",
            intro: `One of the biggest concerns donors have is: "Where does my money actually go?"`,
            box: {
              title: "With CRWD Collectives, you always know:",
              items: [
                "Exactly which nonprofits receive your donation",
                "How much each nonprofit receives (split evenly among all selected orgs)",
                "The total impact your Collective is making each month",
                "Your personal giving history and tax receipts",
              ],
            },
            conclusion: `No hidden fees beyond our platform fee (10% for donations over $10, flat $1 for donations $10 and under). Every dollar is accounted for.`,
          },
          readyToJoin: {
            title: "Ready to Join a Collective?",
            intro: `Whether you join an existing Collective or create your own, you're choosing to give in a way that's:`,
            benefits: [
              {
                icon: Hand,
                iconColor: "text-yellow-600",
                bgColor: "bg-yellow-50",
                text: "More powerful",
              },
              {
                icon: Gem,
                iconColor: "text-yellow-600",
                bgColor: "bg-yellow-50",
                text: "More connected",
              },
              {
                icon: Target,
                iconColor: "text-red-600",
                bgColor: "bg-red-50",
                text: "More focused",
              },
              {
                icon: Zap,
                iconColor: "text-yellow-600",
                bgColor: "bg-yellow-50",
                text: "More effortless",
              },
            ],
          },
          collectiveWaiting: {
            title: "Your Collective is Waiting",
            text1: `Browse Collectives by cause, see how many members each has, and find the community that aligns with your values.`,
            text2: `Or create your own and become the change you want to see.`,
            button1: "Browse Collectives",
            button2: "Create a Collective",
          },
        },
      },
    };

    return articles[articleSlug || "how-to-donate-to-multiple-charities-at-once"] || articles["how-to-donate-to-multiple-charities-at-once"];
  };

  const article = getArticleData(slug);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-base text-gray-500 mb-6 md:mb-8">
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readTime}</span>
          <span>•</span>
          <span>By {article.author}</span>
        </div>

        {/* Main Image */}
        <div className="mb-8 md:mb-12">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-auto rounded-lg md:rounded-xl"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {article.type === "multiple-charities" ? (
            <>
              {/* Introduction */}
              <div className="mb-6 md:mb-8">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                  {article.content.introduction.split("**")[0]}
                  <strong>{article.content.introduction.split("**")[1]}</strong>
                  {article.content.introduction.split("**")[2]}
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                  {article.content.introText}
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.introConclusion}
                </p>
              </div>

              {/* 5 Ways Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  5 Ways to Support Multiple Charities
                </h2>

                <div className="space-y-4 md:space-y-6">
                  {article.content.ways.map((way: any, index: number) => (
                    <div key={index} className="mb-6 md:mb-8">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                        {index + 1}. {way.title}
                      </h3>
                      <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-3 md:mb-4">
                        {way.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm md:text-base text-green-600 font-medium">
                          Good for: {way.goodFor}
                        </p>
                        <p className="text-sm md:text-base text-red-600 font-medium">
                          Downside: {way.downside}
                        </p>
                      </div>

                      {/* Highlight Box for Multi-Charity Platforms */}
                      {way.highlight && (
                        <div className="mt-4 md:mt-6 p-4 md:p-6 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-start gap-3 md:gap-4">
                            <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                              {way.highlightText}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recurring Donations Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.recurringSection.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6 font-semibold">
                  {article.content.recurringSection.statement}
                </p>
                <div className="mb-4">
                  <p className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                    The Math:
                  </p>
                  <ul className="space-y-2 md:space-y-3 list-none">
                    {article.content.recurringSection.math.map((item: string, index: number) => (
                      <li
                        key={index}
                        className="text-base md:text-lg text-gray-700 leading-relaxed"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* How It Works with CRWD Section */}
              <div className="mb-8 md:mb-12">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 md:p-8 mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
                    Here's how it works with CRWD:
                  </h2>
                  <ul className="space-y-3 md:space-y-4">
                    <li className="flex items-start gap-3 text-white">
                      <Check className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
                      <span className="text-base md:text-lg">You set $25/month</span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <Check className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
                      <span className="text-base md:text-lg">You add 5 nonprofits to your Donation Box</span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <Check className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
                      <span className="text-base md:text-lg">Each organization receives $4.50/month ($54/year)</span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <Check className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
                      <span className="text-base md:text-lg">You've just funded clean water, education, climate action, animal welfare, and mental health support with one simple decision</span>
                    </li>
                  </ul>
                </div>

                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6 md:mb-8">
                  Plus, nonprofits love recurring donors because they provide predictable revenue they can actually plan around. Your $10/month matters more than you think.
                </p>
              </div>

              {/* Why Recurring Donations Are Powerful Section */}
              <div className="mb-8 md:mb-12">
                <div className="bg-gray-100 rounded-xl p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                    Why recurring donations are powerful:
                  </h2>
                  <ul className="space-y-3 md:space-y-4">
                    <li className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base md:text-lg text-gray-700">
                        Recurring donors give <strong>42% more annually</strong> than one-time donors
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 text-gray-700 flex-shrink-0 mt-0.5" />
                      <span className="text-base md:text-lg text-gray-700">
                        Nonprofits can budget effectively with steady income
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Target className="w-5 h-5 md:w-6 md:h-6 text-gray-700 flex-shrink-0 mt-0.5" />
                      <span className="text-base md:text-lg text-gray-700">
                        Lower transaction costs = more money for programs
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 md:w-6 md:h-6 text-gray-700 flex-shrink-0 mt-0.5" />
                      <span className="text-base md:text-lg text-gray-700">
                        $5/month to a food bank = 60 meals per year
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Droplet className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base md:text-lg text-gray-700">
                        $10/month for clean water = one person's annual access
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Which Method Should You Choose Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                  Which Method Should You Choose?
                </h2>
                <div className="bg-white border border-gray-300 rounded-xl p-6 md:p-8 mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
                    Quick decision guide:
                  </h3>
                  <ul className="space-y-2 md:space-y-3 text-base md:text-lg text-gray-700">
                    <li>Supporting 1-2 charities? → Individual recurring donations</li>
                    <li>Supporting 3-5 charities? → Multi-charity platform like CRWD</li>
                    <li>Giving $5,000+ annually? → Donor-advised fund for tax benefits</li>
                    <li>Want community aspect? → Giving circles or collectives (CRWD offers both)</li>
                    <li>Employer offers matching? → Workplace giving program</li>
                  </ul>
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  For most people, a platform like CRWD is the simplest solution. It removes all the friction while letting you support every cause that matters to you.
                </p>
              </div>

              {/* How to Start Today Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                  How to Start Today
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center mb-3 md:mb-4">
                      <span className="text-white text-xl md:text-2xl font-bold">1</span>
                    </div>
                    <p className="text-base md:text-lg text-gray-700">
                      <strong>Choose Your Causes</strong> List 3-5 causes you care about (climate, education, animals, health, etc.)
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-full flex items-center justify-center mb-3 md:mb-4">
                      <span className="text-white text-xl md:text-2xl font-bold">2</span>
                    </div>
                    <p className="text-base md:text-lg text-gray-700">
                      <strong>Set Your Budget</strong> Decide your monthly amount (even $10/month = $120/year of impact)
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-600 rounded-full flex items-center justify-center mb-3 md:mb-4">
                      <span className="text-white text-xl md:text-2xl font-bold">3</span>
                    </div>
                    <p className="text-base md:text-lg text-gray-700">
                      <strong>Find Nonprofits</strong> Pick your nonprofits using Charity Navigator or GuideStar for ratings
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-full flex items-center justify-center mb-3 md:mb-4">
                      <span className="text-white text-xl md:text-2xl font-bold">4</span>
                    </div>
                    <p className="text-base md:text-lg text-gray-700">
                      <strong>Create Your Box</strong> Create your CRWD account and add them to your Donation Box
                    </p>
                  </div>
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                  The goal isn't perfection. It's consistency. Start smaller than you think. You can always adjust later.
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  With CRWD, this entire setup takes 60 seconds. No separate accounts. No multiple payment methods. Just one decision that changes everything.
                </p>
              </div>

              {/* From Caring to Doing Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                  From Caring to Doing
                </h2>
                <div className="bg-white border border-gray-300 rounded-xl p-6 md:p-8 mb-4 md:mb-6">
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                    When you start donating to multiple charities consistently, something shifts:
                  </p>
                  <ul className="space-y-2 md:space-y-3 mb-4">
                    <li className="text-base md:text-lg text-gray-700">
                      You stop being someone who "cares about" causes.
                    </li>
                    <li className="text-base md:text-lg text-gray-700">
                      You become someone who <strong className="text-blue-600">"shows up for"</strong> causes.
                    </li>
                  </ul>
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  That identity matters. When you can say "I support five organizations every month," you're not just giving money—you're defining who you are. And that's contagious.
                </p>
              </div>

              {/* Common Questions Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                  Common Questions
                </h2>
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      Is my small donation actually making a difference?
                    </h3>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      Yes. $5/month = 60 meals per year at a food bank. Small donations compound, and recurring donations are more valuable to nonprofits than sporadic large gifts.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      What about platform fees?
                    </h3>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      All donations have fees (credit cards charge 2.2-2.9%). CRWD's fee is 10%, with 90% going directly to your nonprofits. This includes payment processing and ensures your money reaches verified organizations. The convenience often means you give more overall, increasing net impact.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      Can I change which charities I support?
                    </h3>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      Yes. With platforms, you can add or remove nonprofits anytime. Your causes evolve. Your giving should too.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      How do I know nonprofits are legitimate?
                    </h3>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      Check for 501(c)(3) status, high ratings on Charity Navigator or GuideStar, and financial transparency on their websites.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : article.type === "small-donations" ? (
            <>
              {/* Quote */}
              <div className="mb-6 md:mb-8">
                <p className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">
                  {article.content.quote}
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                  {article.content.introduction.split("**")[0]}
                  <strong>{article.content.introduction.split("**")[1]}</strong>
                  {article.content.introduction.split("**")[2]}
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.introText}
                </p>
              </div>

              {/* The Real Impact of Small Donations Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.impactSection.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.impactSection.intro}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                  {article.content.impactSection.cards.map((card: any, index: number) => {
                    const IconComponent = card.icon;
                    return (
                      <div
                        key={index}
                        className={`${card.bgColor} rounded-xl p-4 md:p-6 shadow-sm`}
                      >
                        <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${card.iconColor} mb-3 md:mb-4`} />
                        <p className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                          {card.amount}
                        </p>
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.impactSection.conclusion.split("**")[0]}
                  <strong>{article.content.impactSection.conclusion.split("**")[1]}</strong>
                  {article.content.impactSection.conclusion.split("**")[2]}
                  <strong>{article.content.impactSection.conclusion.split("**")[3]}</strong>
                  {article.content.impactSection.conclusion.split("**")[4]}
                </p>
              </div>

              {/* The Power of Many Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.powerOfMany.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.powerOfMany.intro}
                </p>
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 md:p-8 mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
                    {article.content.powerOfMany.gradientBox.title}
                  </h3>
                  <ul className="space-y-2 md:space-y-3">
                    {article.content.powerOfMany.gradientBox.calculations.map((calc: string, index: number) => (
                      <li key={index} className="text-base md:text-lg font-bold text-white">
                        {calc}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.powerOfMany.conclusion}
                </p>
              </div>

              {/* Why Nonprofits Prefer Small Recurring Donors Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.nonprofitsPrefer.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.nonprofitsPrefer.intro}
                </p>
                <div className="bg-purple-50 rounded-xl p-6 md:p-8 shadow-sm">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
                    {article.content.nonprofitsPrefer.box.title}
                  </h3>
                  <ul className="space-y-3 md:space-y-4">
                    {article.content.nonprofitsPrefer.box.items.map((item: any, index: number) => {
                      const IconComponent = item.icon;
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-gray-700 flex-shrink-0 mt-0.5" />
                          <span className="text-base md:text-lg text-gray-700 leading-relaxed">
                            {item.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* But I Can Barely Afford It Myself Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.affordIt.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                  {article.content.affordIt.intro}
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.affordIt.intro2}
                </p>
                <div className="bg-gray-100 border-l-4 border-purple-600 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">
                    {article.content.affordIt.coffeeTest.title}
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {article.content.affordIt.coffeeTest.text}
                  </p>
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.affordIt.conclusion}
                </p>
              </div>

              {/* Becoming a Philanthropist Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.becomingPhilanthropist.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.becomingPhilanthropist.intro}
                </p>
                
                {/* Grey Box */}
                <div className="bg-gray-100 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    {article.content.becomingPhilanthropist.greyBox.text1.split("**")[0]}
                    <strong className="text-blue-600">{article.content.becomingPhilanthropist.greyBox.text1.split("**")[1]}</strong>
                    {article.content.becomingPhilanthropist.greyBox.text1.split("**")[2]}
                  </p>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {article.content.becomingPhilanthropist.greyBox.text2}
                  </p>
                </div>

                {/* Identity Shift Text */}
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6 md:mb-8">
                  {article.content.becomingPhilanthropist.identityShift}
                </p>

                {/* Start Small, Think Big Section */}
                <div className="mb-8 md:mb-12">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                    {article.content.becomingPhilanthropist.startSmall.title}
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                    {article.content.becomingPhilanthropist.startSmall.question}
                  </p>
                  <div className="space-y-4 md:space-y-6">
                    {article.content.becomingPhilanthropist.startSmall.tips.map((tip: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 md:gap-6">
                        <div className={`${tip.color} w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xl md:text-2xl font-bold">{tip.number}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                            {tip.title}
                          </h4>
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                            {tip.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Your Small Donation Matters Section */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl p-6 md:p-10 lg:p-12 text-center mb-8 md:mb-12">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
                    {article.content.becomingPhilanthropist.smallDonationMatters.title}
                  </h3>
                  <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed mb-4 md:mb-6">
                    {article.content.becomingPhilanthropist.smallDonationMatters.text1}
                  </p>
                  <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed mb-6 md:mb-8">
                    {article.content.becomingPhilanthropist.smallDonationMatters.text2}
                  </p>
                  <button
                    onClick={() => navigate("/waitlist")}
                    className="bg-white text-purple-600 font-bold px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg border-2 border-purple-600 hover:bg-gray-100 transition-colors"
                  >
                    {article.content.becomingPhilanthropist.smallDonationMatters.buttonText}
                  </button>
                </div>
              </div>
            </>
          ) : article.type === "collective" ? (
            <>
              {/* Introduction */}
              <div className="mb-6 md:mb-8">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                  {article.content.intro.text1}
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 font-semibold">
                  {article.content.intro.text2}
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.intro.text3}
                </p>
              </div>

              {/* How Collectives Work Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.howItWorks.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.howItWorks.intro}
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">
                    Here's how it works in 3 simple steps:
                  </h3>
                  <div className="space-y-4 md:space-y-6">
                    {article.content.howItWorks.steps.map((step: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 md:gap-6">
                        <div className={`${step.color} w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xl md:text-2xl font-bold">{step.number}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                            {step.title}
                          </h4>
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* A Real Example Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.realExample.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.realExample.intro}
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    Your monthly donation: <strong>{article.content.realExample.example.yourDonation}</strong>
                  </p>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    Collective members: <strong>{article.content.realExample.example.members}</strong>
                  </p>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    Collective Impact: <strong>{article.content.realExample.example.collectiveImpact}</strong>
                  </p>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    {article.content.realExample.example.yearlyImpact}
                  </p>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {article.content.realExample.example.detail}
                  </p>
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.realExample.conclusion}
                </p>
              </div>

              {/* Why Join a Collective Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.whyJoin.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.whyJoin.intro}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {article.content.whyJoin.benefits.map((benefit: any, index: number) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div
                        key={index}
                        className={`${benefit.bgColor} rounded-xl p-4 md:p-6`}
                      >
                        <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${benefit.iconColor} mb-3 md:mb-4`} />
                        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Can I Create My Own Collective Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.createOwn.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.createOwn.answer}
                </p>
              </div>
            </>
          ) : article.type === "collective" ? (
            <>
              {/* Introduction */}
              <div className="mb-6 md:mb-8">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                  {article.content.intro.text1}
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 font-semibold">
                  {article.content.intro.text2}
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.intro.text3}
                </p>
              </div>

              {/* How Collectives Work Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.howItWorks.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.howItWorks.intro}
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">
                    Here's how it works in 3 simple steps:
                  </h3>
                  <div className="space-y-4 md:space-y-6">
                    {article.content.howItWorks.steps.map((step: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 md:gap-6">
                        <div className={`${step.color} w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xl md:text-2xl font-bold">{step.number}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                            {step.title}
                          </h4>
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* A Real Example Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.realExample.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.realExample.intro}
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    Your monthly donation: <strong>{article.content.realExample.example.yourDonation}</strong>
                  </p>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    Collective members: <strong>{article.content.realExample.example.members}</strong>
                  </p>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    Collective Impact: <strong>{article.content.realExample.example.collectiveImpact}</strong>
                  </p>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    {article.content.realExample.example.yearlyImpact}
                  </p>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {article.content.realExample.example.detail}
                  </p>
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.realExample.conclusion}
                </p>
              </div>

              {/* Why Join a Collective Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.whyJoin.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.whyJoin.intro}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {article.content.whyJoin.benefits.map((benefit: any, index: number) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div
                        key={index}
                        className={`${benefit.bgColor} rounded-xl p-4 md:p-6`}
                      >
                        <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${benefit.iconColor} mb-3 md:mb-4`} />
                        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Can I Create My Own Collective Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.createOwn.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.createOwn.answer}
                </p>
                <div className="bg-purple-50 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">
                    {article.content.createOwn.box.title}
                  </h3>
                  <ul className="space-y-3 md:space-y-4">
                    {article.content.createOwn.box.items.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-gray-900 flex-shrink-0 mt-0.5" />
                        <span className="text-base md:text-lg text-gray-700 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.createOwn.conclusion}
                </p>
              </div>

              {/* Complete Transparency Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.transparency.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.transparency.intro}
                </p>
                <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">
                    {article.content.transparency.box.title}
                  </h3>
                  <ul className="space-y-3 md:space-y-4">
                    {article.content.transparency.box.items.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-gray-900 flex-shrink-0 mt-0.5" />
                        <span className="text-base md:text-lg text-gray-700 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {article.content.transparency.conclusion}
                </p>
              </div>

              {/* Ready to Join a Collective Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  {article.content.readyToJoin.title}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {article.content.readyToJoin.intro}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {article.content.readyToJoin.benefits.map((benefit: any, index: number) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div
                        key={index}
                        className={`${benefit.bgColor} rounded-xl p-4 md:p-6`}
                      >
                        <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${benefit.iconColor} mb-3 md:mb-4`} />
                        <p className="text-base md:text-lg font-bold text-gray-900">
                          {benefit.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Your Collective is Waiting Section */}
              <div className="mb-8 md:mb-12">
                <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl p-6 md:p-10 lg:p-12 text-center">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
                    {article.content.collectiveWaiting.title}
                  </h2>
                  <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed mb-4">
                    {article.content.collectiveWaiting.text1}
                  </p>
                  <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed mb-6 md:mb-8">
                    {article.content.collectiveWaiting.text2}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
                    <button
                      onClick={() => navigate("/circles")}
                      className="bg-white text-purple-600 font-bold px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg border-2 border-white hover:bg-gray-100 transition-colors"
                    >
                      {article.content.collectiveWaiting.button1}
                    </button>
                    <button
                      onClick={() => navigate("/create-crwd")}
                      className="bg-white text-purple-600 font-bold px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg border-2 border-white hover:bg-gray-100 transition-colors"
                    >
                      {article.content.collectiveWaiting.button2}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {/* Start Today Banner */}
          <div className="mb-8 md:mb-12">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 md:p-10 lg:p-12 text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
                Start Today
              </h2>
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-white text-base md:text-lg lg:text-xl">
                <p>You've been meaning to give. The tools now exist to make supporting multiple charities effortless.</p>
                <p>The question isn't "Can I afford to give?"</p>
                <p className="font-bold">The question is: "Can I afford not to become someone who shows up?"</p>
                <p>The world doesn't need more people who care. It needs more people who do.</p>
              </div>
              <button
                onClick={() => navigate("/waitlist")}
                className="bg-white text-blue-600 font-bold px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg hover:bg-gray-100 transition-colors"
              >
                Start Your Donation Box
              </button>
            </div>
          </div>

          {/* More Articles Section */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
              More Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[
                { slug: "how-to-donate-to-multiple-charities-at-once", title: "How to Donate to Multiple Charities at Once", description: "Learn how to support multiple causes with one decision..." },
                { slug: "why-small-donations-matter", title: "Why Small Donations Matter", description: "Learn how small donations make a big impact..." },
                { slug: "what-is-a-crwd-collective", title: "What is a CRWD collective?", description: "Learn how collectives amplify your impact through community giving..." },
              ].map((relatedArticle) => {
                const isCurrentArticle = relatedArticle.slug === slug;
                return (
                  <div
                    key={relatedArticle.slug}
                    onClick={() => {
                      if (!isCurrentArticle) {
                        navigate(`/article/${relatedArticle.slug}`);
                      }
                    }}
                    className={`bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm transition-shadow ${
                      isCurrentArticle 
                        ? 'opacity-60 cursor-default' 
                        : 'hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {relatedArticle.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default ArticleDetail;

