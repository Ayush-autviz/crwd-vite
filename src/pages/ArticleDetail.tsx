import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import ProfileNavbar from "@/components/profile/ProfileNavbar";

const ArticleDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const articles: Record<string, {
    title: string;
    date: string;
    readTime: string;
    author: string;
    category: string;
    content: JSX.Element;
  }> = {
    "how-to-donate-to-multiple-charities-at-once": {
      title: "How to Donate to Multiple Charities at Once",
      date: "November 9, 2025",
      readTime: "6 min read",
      author: "CRWD Team",
      category: "Donation Guides",
      content: (
        <>
          <p className="text-gray-700 mb-4" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8', fontSize: '1.125rem' }}>
            You care about clean water, education, climate action, animal welfare, and mental health support. <strong style={{ fontFamily: 'var(--font-headline)', fontWeight: 600 }}>But supporting all of them feels impossible.</strong>
          </p>

          <p className="text-gray-700 mb-6" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8', fontSize: '1.125rem' }}>
            Here's the truth most people face: <strong style={{ fontFamily: 'var(--font-headline)', fontWeight: 600 }}>You care about everything, but you give to nothing.</strong>
          </p>

          <p className="text-gray-700 mb-10" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            The problem isn't that you don't want to help. It's that managing multiple donations is complicated. Different websites, multiple charges, scattered tax receipts. The friction stops you before you start.
          </p>

          <h2
            className="mb-8 mt-10"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            5 Ways to Support Multiple Charities
          </h2>

          {/* 1. Individual Recurring Donations */}
          <div className="mb-10 border-b border-gray-100 pb-8">
            <h3
              className="mb-3"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.5rem'
              }}
            >
              1. Individual Recurring Donations
            </h3>
            <p className="text-gray-700 mb-4" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
              Set up separate monthly donations on each nonprofit's website.
            </p>
            <p className="text-gray-700 mb-2" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              <span className="text-emerald-500 font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Good for:</span> 2-3 charities maximum
            </p>
            <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              <span className="text-red-500 font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Downside:</span> Multiple charges and administrative work
            </p>
          </div>

          {/* 2. Donor-Advised Funds (DAFs) */}
          <div className="mb-10 border-b border-gray-100 pb-8">
            <h3
              className="mb-3"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.5rem'
              }}
            >
              2. Donor-Advised Funds (DAFs)
            </h3>
            <p className="text-gray-700 mb-4" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
              Contribute to a fund (like Fidelity Charitable), get a tax deduction, then grant to charities over time.
            </p>
            <p className="text-gray-700 mb-2" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              <span className="text-emerald-500 font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Good for:</span> Donors giving $5,000+ annually
            </p>
            <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              <span className="text-red-500 font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Downside:</span> High minimums and complexity
            </p>
          </div>

          {/* 3. Workplace Giving Programs */}
          <div className="mb-10 border-b border-gray-100 pb-8">
            <h3
              className="mb-3"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.5rem'
              }}
            >
              3. Workplace Giving Programs
            </h3>
            <p className="text-gray-700 mb-4" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
              Many employers match donations and allow payroll deductions to multiple nonprofits.
            </p>
            <p className="text-gray-700 mb-2" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              <span className="text-emerald-500 font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Good for:</span> Employees with matching programs
            </p>
            <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              <span className="text-red-500 font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Downside:</span> Limited to employer's approved charities
            </p>
          </div>

          {/* 4. Giving Collectives */}
          <div className="mb-10 border-b border-gray-100 pb-8">
            <h3
              className="mb-3"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.5rem'
              }}
            >
              4. Giving Collectives
            </h3>
            <p className="text-gray-700 mb-4" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
              Join a group of people pooling donations together for shared causes. Your contribution combines with others for greater impact.
            </p>
            <p className="text-gray-700 mb-2" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              <span className="text-emerald-500 font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Good for:</span> People who want community and collective power
            </p>
            <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              <span className="text-red-500 font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Downside:</span> Less control over individual nonprofit selection
            </p>
          </div>

          {/* 5. Donation Box Platforms */}
          <div className="mb-12">
            <h3
              className="mb-3"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.5rem'
              }}
            >
              5. Donation Box Platforms (like CRWD)
            </h3>
            <p className="text-gray-700 mb-4" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
              Choose any nonprofits you want and manage them all in one place with a single monthly payment.
            </p>
            <p className="text-gray-700 mb-2" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              <span className="text-emerald-500 font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Good for:</span> Anyone who wants flexibility and simplicity
            </p>
            <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              <span className="text-emerald-500 font-bold" style={{ fontFamily: 'var(--font-headline)' }}>Benefit:</span> Full control, easy management, transparent tracking
            </p>
          </div>

          <h2
            className="mb-8 mt-12"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            How to Get Started in 4 Steps
          </h2>

          <div className="bg-gray-50 rounded-xl p-8 mb-12 border border-gray-100">
            <div className="space-y-8">
              <div className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: '#1E40AF', // Dark blue
                    color: '#fff',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700
                  }}
                >
                  1
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      fontSize: '1.125rem'
                    }}
                  >
                    List Your Causes
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                    Write down the causes you care about most (environment, education, health, etc.)
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: '#A855F7', // Purple
                    color: '#fff',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700
                  }}
                >
                  2
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      fontSize: '1.125rem'
                    }}
                  >
                    Set Your Budget
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                    Decide your monthly amount (even $10/month = $120/year of impact)
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: '#FF3366', // Pink
                    color: '#fff',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700
                  }}
                >
                  3
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      fontSize: '1.125rem'
                    }}
                  >
                    Find Nonprofits
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                    Browse verified nonprofits using tools like Charity Navigator or CRWD's curated directory
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: '#ADFF2F', // Lime
                    color: '#000',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700
                  }}
                >
                  4
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      fontSize: '1.125rem'
                    }}
                  >
                    Automate Your Giving
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                    Set up recurring donations so giving becomes effortless and consistent
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 border-l-4 border-slate-900 p-6 mb-12">
            <p className="text-gray-800" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
              <strong style={{ fontFamily: 'var(--font-headline)', fontWeight: 600 }}>The goal isn't perfection. It's consistency.</strong> Start smaller than you think. You can always adjust later.
            </p>
          </div>

          <h2
            className="mb-8 mt-12"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            Common Questions
          </h2>

          <div className="space-y-8 mb-12">
            <div className="border-b border-gray-100 pb-8">
              <h3
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '1.125rem'
                }}
              >
                "Is my small donation actually making a difference?"
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
                Yes. $5/month provides 60 meals per year at food banks. Small recurring donations are more valuable to nonprofits than sporadic large gifts.
              </p>
            </div>

            <div className="border-b border-gray-100 pb-8">
              <h3
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '1.125rem'
                }}
              >
                "What about platform fees?"
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
                All donations have fees (credit cards charge 2.2-2.9%). CRWD's fee is 10%, with 90% going directly to your nonprofits. The convenience often means you give more overall, increasing net impact.
              </p>
            </div>

            <div className="pb-4">
              <h3
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '1.125rem'
                }}
              >
                "Can I change which charities I support?"
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
                Yes. With platforms like CRWD, you can add or remove nonprofits anytime. Your causes evolve, and your giving should too.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-8 sm:p-12 text-center mt-12 mb-16">
            <h2
              className="mb-4 text-white"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '2rem'
              }}
            >
              Start Today
            </h2>
            <p className="mb-8 text-slate-300 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8', fontSize: '1.125rem' }}>
              The tools now exist to make supporting multiple charities effortless. The question isn't "Can I afford to give?" but rather "Can I afford not to become someone who shows up?"
            </p>
            <Button
              onClick={() => navigate('/browse')}
              size="lg"
              className="rounded-full bg-[#1600ff] hover:bg-[#1400cc] text-white px-8 py-6 text-lg font-bold"
            // style={{
            //   fontFamily: 'var(--font-headline)'
            // }}
            >
              Start Your Donation Box
            </Button>
          </div>

          {/* Related Articles */}
          <section className="mt-20 pt-10 border-t border-gray-100">
            <h2
              className="mb-8"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.5rem'
              }}
            >
              Related Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="bg-white border border-gray-100 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate('/article/why-small-donations-matter')}
              >
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  Why Small Donations Matter
                </h3>
                <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-subhead)' }}>
                  4 min read
                </p>
              </div>

              <div
                className="bg-white border border-gray-100 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate('/article/what-is-a-crwd-collective')}
              >
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  What is a CRWD Collective?
                </h3>
                <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-subhead)' }}>
                  5 min read
                </p>
              </div>
            </div>
          </section>
        </>
      )
    },
    "why-small-donations-matter": {
      title: "Why Small Donations Matter",
      date: "November 10, 2025",
      readTime: "4 min read",
      author: "CRWD Team",
      category: "Impact",
      content: (
        <>
          <p className="text-gray-500 italic mb-6" style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem' }}>
            "$5 won't make a difference."
          </p>

          <p className="text-gray-700 mb-6" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8', fontSize: '1.125rem' }}>
            That's what most <strong style={{ fontFamily: 'var(--font-headline)', fontWeight: 600 }}>people</strong> think when they consider donating. They imagine their small contribution disappearing into a void, too insignificant to matter.
          </p>

          <p className="text-gray-700 mb-10" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8', fontSize: '1.125rem' }}>
            But here's what they don't realize: Small donations are the lifeblood of nonprofit work. They're not just helpful, they're essential.
          </p>

          <h2
            className="mb-6 mt-10"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            The Real Impact of Small Donations
          </h2>

          <p className="text-gray-700 mb-8" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            Let's put actual numbers to what small donations can do:
          </p>

          <div className="border border-gray-200 rounded-xl p-6 sm:p-8 mb-10 space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h3
                className="text-blue-600 mb-2"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '1.25rem'
                }}
              >
                $5/month
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                Provides clean water access for one person for an entire year
              </p>
            </div>

            <div className="border-b border-gray-100 pb-6">
              <h3
                className="text-purple-600 mb-2"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '1.25rem'
                }}
              >
                $10/month
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                Feeds a family of four for a week through food banks
              </p>
            </div>

            <div className="border-b border-gray-100 pb-6">
              <h3
                className="text-pink-500 mb-2"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '1.25rem'
                }}
              >
                $15/month
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                Supplies school materials for three children in need
              </p>
            </div>

            <div>
              <h3
                className="text-lime-500 mb-2"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '1.25rem'
                }}
              >
                $25/month
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                Covers basic medical care for two people in underserved communities
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-12" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            These aren't theoretical numbers. They're real outcomes from organizations doing real work. Your small donation isn't a drop in the ocean, it's a ripple that creates waves.
          </p>

          <h2
            className="mb-6"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            The Power of Collective Giving
          </h2>

          <p className="text-gray-700 mb-8" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            Small donations become transformative when combined with others:
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-12">
            <h3
              className="mb-4"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.25rem'
              }}
            >
              The Math of Collective Impact
            </h3>
            <ul className="space-y-3">
              <li className="text-gray-700 bg-white/50 p-2 rounded" style={{ fontFamily: 'var(--font-subhead)' }}>
                • 100 people × $10/month = <strong style={{ fontFamily: 'var(--font-headline)' }}>$12,000/year</strong>
              </li>
              <li className="text-gray-700 bg-white/50 p-2 rounded" style={{ fontFamily: 'var(--font-subhead)' }}>
                • 1,000 people × $10/month = <strong style={{ fontFamily: 'var(--font-headline)' }}>$120,000/year</strong>
              </li>
              <li className="text-gray-700 bg-white/50 p-2 rounded" style={{ fontFamily: 'var(--font-subhead)' }}>
                • 10,000 people × $10/month = <strong style={{ fontFamily: 'var(--font-headline)' }}>$1.2 million/year</strong>
              </li>
            </ul>
          </div>

          <p className="text-gray-700 mb-12" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            Your $10 doesn't stand alone. It joins thousands of other donations to fund entire programs, build infrastructure, and create lasting change.
          </p>

          <h2
            className="mb-6"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            Why Nonprofits Prefer Small Recurring Donors
          </h2>

          <p className="text-gray-700 mb-8" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            You might think nonprofits only care about big donors. The reality is different:
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-12 border border-gray-100">
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-blue-600 text-xl font-bold">•</span>
                <span className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                  <strong style={{ fontFamily: 'var(--font-headline)', color: '#000' }}>Predictable revenue:</strong> Recurring donations let nonprofits plan programs months in advance
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 text-xl font-bold">•</span>
                <span className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                  <strong style={{ fontFamily: 'var(--font-headline)', color: '#000' }}>Lower risk:</strong> 1,000 small donors are more sustainable than 10 large donors
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 text-xl font-bold">•</span>
                <span className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                  <strong style={{ fontFamily: 'var(--font-headline)', color: '#000' }}>Community building:</strong> Small donors often become advocates and volunteers
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 text-xl font-bold">•</span>
                <span className="text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                  <strong style={{ fontFamily: 'var(--font-headline)', color: '#000' }}>Long-term value:</strong> A $10/month donor over 5 years contributes $600 in total impact
                </span>
              </li>
            </ul>
          </div>

          <h2
            className="mb-8"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            Start Small, Think Big
          </h2>

          <p className="text-gray-700 mb-8" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            Ready to become a small donor who makes a big impact?
          </p>

          <div className="space-y-8 mb-12">
            <div className="flex gap-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: '#1E40AF',
                  color: '#fff',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700
                }}
              >
                1
              </div>
              <div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  Pick an amount that won't stress you
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                  It's better to give $5 consistently than $50 once and never again.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: '#A855F7',
                  color: '#fff',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700
                }}
              >
                2
              </div>
              <div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  Choose causes that resonate with you
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                  You'll stick with giving when it's connected to your values.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: '#FF3366',
                  color: '#fff',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700
                }}
              >
                3
              </div>
              <div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  Make it automatic
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                  Set up recurring donations so you don't have to think about it each month.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-8 sm:p-12 mt-12 mb-16">
            <h2
              className="mb-6 text-white"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '2rem'
              }}
            >
              Your Small Donation Matters
            </h2>
            <p className="mb-6 text-slate-300" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8', fontSize: '1.125rem' }}>
              Every movement starts with individuals making small choices. Climate action, civil rights, public health all began with people contributing what they could, when they could.
            </p>
            <p className="mb-10 text-white font-bold" style={{ fontFamily: 'var(--font-headline)', lineHeight: '1.4', fontSize: '1.25rem' }}>
              Your $5, $10, or $25 per month is a declaration that you show up for the world you want to see.
            </p>
            <Button
              onClick={() => navigate('/browse')}
              size="lg"
              className="rounded-full bg-[#1600ff] hover:bg-[#1400cc] text-white px-8 py-6 text-lg font-bold w-full sm:w-auto"
            >
              Start Giving Today
            </Button>
          </div>

          {/* Related Articles */}
          <section className="mt-20 pt-10 border-t border-gray-100">
            <h2
              className="mb-8"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.5rem'
              }}
            >
              Related Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="bg-white border border-gray-100 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate('/article/how-to-donate-to-multiple-charities-at-once')}
              >
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  How to Donate to Multiple Charities at Once
                </h3>
                <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-subhead)' }}>
                  6 min read
                </p>
              </div>

              <div
                className="bg-white border border-gray-100 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate('/article/what-is-a-crwd-collective')}
              >
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  What is a CRWD Collective?
                </h3>
                <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-subhead)' }}>
                  5 min read
                </p>
              </div>
            </div>
          </section>
        </>
      )
    },
    "what-is-a-crwd-collective": {
      title: "What is a CRWD Collective?",
      date: "November 11, 2025",
      readTime: "5 min read",
      author: "CRWD Team",
      category: "Collectives",
      content: (
        <>
          <p className="text-gray-700 mb-6" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8', fontSize: '1.125rem' }}>
            Imagine having the giving power of 100 people without spending more than you already planned to donate.
          </p>

          <p className="text-gray-700 mb-6" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8', fontSize: '1.125rem' }}>
            That's the magic of a CRWD Collective.
          </p>

          <p className="text-gray-700 mb-10" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8', fontSize: '1.125rem' }}>
            A Collective is a group of people who pool their monthly donations together to support multiple nonprofits at once. Think of it as a giving circle, but automated, transparent, and built for modern donors.
          </p>

          <h2
            className="mb-6 mt-10"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            How Collectives Work
          </h2>

          <p className="text-gray-700 mb-8" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            Every Collective on CRWD is built around a shared purpose, whether that's protecting the ocean, advancing education, supporting mental health, or any cause that matters to you.
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-12 border border-gray-100">
            <h3
              className="mb-8"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.25rem'
              }}
            >
              Here's how it works in 3 simple steps:
            </h3>

            <div className="space-y-8">
              <div className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: '#1E40AF', // Dark blue
                    color: '#fff',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700
                  }}
                >
                  1
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      fontSize: '1.125rem'
                    }}
                  >
                    Join (or create) a Collective
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                    Browse Collectives by cause, join one that aligns with your values, or create your own.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: '#A855F7', // Purple
                    color: '#fff',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700
                  }}
                >
                  2
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      fontSize: '1.125rem'
                    }}
                  >
                    Set your monthly amount
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                    Choose what you can afford. Your donation gets split evenly among the Collective's nonprofits.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: '#FF3366', // Pink
                    color: '#fff',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700
                  }}
                >
                  3
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontWeight: 700,
                      fontSize: '1.125rem'
                    }}
                  >
                    Watch the impact grow
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                    As more people join your Collective, you'll see the total monthly giving grow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h2
            className="mb-6"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            A Real Example
          </h2>

          <p className="text-gray-700 mb-8" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            Let's say you care about ocean conservation. You join the <strong style={{ fontFamily: 'var(--font-headline)', fontWeight: 600 }}>"Team Ocean Cleanup"</strong> Collective.
          </p>

          <div className="border border-gray-200 rounded-xl p-8 mb-12">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-headline)', fontWeight: 600 }}>Your monthly donation:</p>
                <p className="text-blue-600 text-2xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>$10/month</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-headline)', fontWeight: 600 }}>Collective members:</p>
                <p className="text-purple-500 text-2xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>150 people</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-headline)', fontWeight: 600 }}>Collective Impact:</p>
              <p className="text-black text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-headline)' }}>$1,500/month</p>
              <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-subhead)' }}>$18,000 per year going to ocean conservation</p>
            </div>

            <p className="text-gray-600 text-sm" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
              The Collective supports 5 verified ocean nonprofits, so each organization receives <strong className="text-gray-900">$300/month</strong> from your group.
            </p>
          </div>

          <p className="text-gray-700 mb-12" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            Your $10 helped five nonprofits, and you donated as part of a movement of 150 people who care about the same cause.
          </p>

          <h2
            className="mb-8"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            Why Join a Collective?
          </h2>

          <p className="text-gray-700 mb-8" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            You could donate on your own. But here's what you get when you join a Collective:
          </p>

          <div className="space-y-6 mb-12">
            <div className="border border-gray-200 rounded-xl p-6">
              <h3
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '1.125rem'
                }}
              >
                Curated nonprofits
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                Every Collective selects high-impact nonprofits, so you don't have to do hours of research.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '1.125rem'
                }}
              >
                Community & belonging
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                Connect with like-minded people who share your values and inspire each other.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: '1.125rem'
                }}
              >
                Amplified impact
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                Your donation becomes part of a larger pool, which means nonprofits receive more predictable funding.
              </p>
            </div>
          </div>

          <h2
            className="mb-6"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            Can I Create My Own Collective?
          </h2>

          <p className="text-gray-700 mb-8" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            Absolutely! Creating a Collective takes just a few minutes.
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-12 border border-gray-100">
            <h3
              className="mb-4"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.125rem'
              }}
            >
              When you create a Collective, you:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Choose the cause or theme (e.g., Climate Action, Animal Welfare, Mental Health Support)</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Select nonprofits to support (you can add more as your Collective grows)</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Share with friends, family, and like-minded people to join</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span><strong style={{ fontFamily: 'var(--font-headline)' }}>Create fundraisers for urgent causes</strong>, even for nonprofits outside your Collective's main list</span>
              </li>
            </ul>
          </div>

          <h2
            className="mb-6"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            Complete Transparency
          </h2>

          <p className="text-gray-700 mb-8" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8' }}>
            One of the biggest concerns donors have is: "Where does my money actually go?"
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-12 border-l-4 border-slate-900">
            <h3
              className="mb-4 text-sm uppercase tracking-wide text-gray-500"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 600,
              }}
            >
              With CRWD Collectives, you always know:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Exactly which nonprofits receive your donation</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>How much each nonprofit receives (split evenly among all selected orgs)</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>The total impact your Collective is making each month</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.6' }}>
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Your personal giving history and tax receipts</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 rounded-xl p-8 sm:p-12 mt-12 mb-16">
            <h2
              className="mb-4 text-white"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '2rem'
              }}
            >
              Your Collective is Waiting
            </h2>
            <p className="mb-8 text-slate-300 max-w-2xl" style={{ fontFamily: 'var(--font-subhead)', lineHeight: '1.8', fontSize: '1.125rem' }}>
              Browse Collectives by cause, see how many members each has, and find the community that aligns with your values. Or create your own and become the change you want to see.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/browse')}
                size="lg"
                className="rounded-full bg-[#1600ff] hover:bg-[#1400cc] text-white px-8 py-6 text-lg font-bold"
              >
                Browse Collectives
              </Button>
              <Button
                onClick={() => navigate('/new')}
                size="lg"
                variant="outline"
                className="rounded-full border-white text-white hover:bg-white hover:text-slate-900 px-8 py-6 text-lg font-bold bg-transparent"
              >
                Create a Collective
              </Button>
            </div>
          </div>

          {/* Related Articles */}
          <section className="mt-20 pt-10 border-t border-gray-100">
            <h2
              className="mb-8"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '1.5rem'
              }}
            >
              Related Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="bg-white border border-gray-100 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate('/article/how-to-donate-to-multiple-charities-at-once')}
              >
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  How to Donate to Multiple Charities at Once
                </h3>
                <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-subhead)' }}>
                  6 min read
                </p>
              </div>

              <div
                className="bg-white border border-gray-100 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate('/article/why-small-donations-matter')}
              >
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  Why Small Donations Matter
                </h3>
                <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-subhead)' }}>
                  4 min read
                </p>
              </div>
            </div>
          </section>
        </>
      )
    }
  };

  const article = articles[slug || ""];

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <ProfileNavbar
          title="Articles"
          showBackButton={true}
          showMobileMenu={true}
          showDesktopMenu={true}
        />
        <div className="container mx-auto px-4 max-w-3xl text-center mt-20">
          <h1
            className="mb-4"
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '2rem'
            }}
          >
            Article Not Found
          </h1>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* <ProfileNavbar
        title="Articles"
        showBackButton={true}
        showMobileMenu={true}
        showDesktopMenu={true}
      /> */}

      <div className="pb-20">
        <div className="">
          <div className="bg-gradient-to-br from-[#f1f6ff] via-[#f9f6ff] to-[#fbf5fe] p-2">
            <div className="container mx-auto px-4 mt-10 max-w-3xl">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="mb-8 -ml-3 hover:bg-gray-50 text-gray-600 pl-0 hover:pl-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <h1
                className="mb-6"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  lineHeight: '1.1',
                  color: '#000'
                }}
              >
                {article.title}
              </h1>

              <div className="flex items-center gap-3 text-gray-500 mb-12 text-sm md:text-base" style={{ fontFamily: 'var(--font-subhead)' }}>
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readTime}</span>
                <span>•</span>
                <span>By {article.author}</span>
              </div>
            </div>
          </div>

          <article className="max-w-3xl mx-auto pt-8 md:pt-16 px-4">
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-p:text-gray-700">
              {article.content}
            </div>
          </article>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default ArticleDetail;
