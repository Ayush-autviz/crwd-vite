import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const Footer = () => {
  const [openSections, setOpenSections] = useState<{
    platform: boolean;
    resources: boolean;
    support: boolean;
  }>({
    platform: false,
    resources: false,
    support: false,
  });

  const toggleSection = (section: "platform" | "resources" | "support") => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Logo at Top */}
        <div className="mb-4 md:mb-6">
          <div className="text-xl md:text-2xl lg:text-3xl font-bold">crwd</div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-gray-800 mb-6 md:mb-8"></div>

        {/* Categories Grid */}
        <div className="space-y-0 md:grid md:grid-cols-3 md:gap-6 lg:gap-12 mb-8 md:mb-12">
          {/* Platform Column */}
          <div className="border-b border-gray-800 pb-4 md:border-b-0 md:pb-0">
            <button
              onClick={() => toggleSection("platform")}
              className="flex items-center justify-between w-full md:justify-start md:pointer-events-none "
            >
              <h3 className="font-bold text-sm md:text-base lg:text-lg">Platform</h3>
              <ChevronDown
                className={`w-4 h-4 md:hidden transition-transform ${openSections.platform ? "rotate-180" : ""
                  }`}
              />
            </button>
            <nav
              className={`space-y-1.5 md:space-y-2 ${openSections.platform ? "block" : "hidden"
                } md:block`}
            >
              <Link
                to="/search"
                className="block text-white hover:text-gray-300 transition-colors text-xs md:text-sm lg:text-base"
              >
                Find Nonprofits
              </Link>
              <Link
                to="/create-crwd"
                className="block text-white hover:text-gray-300 transition-colors text-xs md:text-sm lg:text-base"
              >
                Start a Collective
              </Link>
              <Link
                to="/circles"
                className="block text-white hover:text-gray-300 transition-colors text-xs md:text-sm lg:text-base"
              >
                Browse Collectives
              </Link>
            </nav>
          </div>

          {/* Resources Column */}
          <div className="border-b border-gray-800 pb-4 md:border-b-0 md:pb-0">
            <button
              onClick={() => toggleSection("resources")}
              className="flex items-center justify-between w-full md:justify-start md:pointer-events-none mt-5 md:mt-0"
            >
              <h3 className="font-bold text-sm md:text-base lg:text-lg">Resources</h3>
              <ChevronDown
                className={`w-4 h-4 md:hidden transition-transform ${openSections.resources ? "rotate-180" : ""
                  }`}
              />
            </button>
            <nav
              className={`space-y-1.5 md:space-y-2 ${openSections.resources ? "block" : "hidden"
                } md:block`}
            >
              <Link
                to="/settings/about"
                className="block text-white hover:text-gray-300 transition-colors text-xs md:text-sm lg:text-base"
              >
                How it works
              </Link>
              <Link
                to="/articles"
                className="block text-white hover:text-gray-300 transition-colors text-xs md:text-sm lg:text-base"
              >
                What is a CRWD collective?
              </Link>
              <Link
                to="/settings/help"
                className="block text-white hover:text-gray-300 transition-colors text-xs md:text-sm lg:text-base"
              >
                FAQs
              </Link>
            </nav>
          </div>

          {/* Support Column */}
          <div className="border-b border-gray-800 pb-4 md:border-b-0 md:pb-0">
            <button
              onClick={() => toggleSection("support")}
              className="flex items-center justify-between w-full md:justify-start md:pointer-events-none mb-3 md:mb-4 mt-5 md:mt-0"
            >
              <h3 className="font-bold text-sm md:text-base lg:text-lg">Support</h3>
              <ChevronDown
                className={`w-4 h-4 md:hidden transition-transform ${openSections.support ? "rotate-180" : ""
                  }`}
              />
            </button>
            <nav
              className={`space-y-1.5 md:space-y-2 ${openSections.support ? "block" : "hidden"
                } md:block`}
            >
              <Link
                to="/settings/help"
                className="block text-white hover:text-gray-300 transition-colors text-xs md:text-sm lg:text-base"
              >
                Help Center
              </Link>
              <Link
                to="/settings/report"
                className="block text-white hover:text-gray-300 transition-colors text-xs md:text-sm lg:text-base"
              >
                Contact Us
              </Link>
              <Link
                to="/settings/privacy"
                className="block text-white hover:text-gray-300 transition-colors text-xs md:text-sm lg:text-base"
              >
                Privacy Policy
              </Link>
              <Link
                to="/settings/terms"
                className="block text-white hover:text-gray-300 transition-colors text-xs md:text-sm lg:text-base"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        {/* App Download Section - Left Side */}
        <div className="mb-8 md:mb-12">
          <p className="text-xs md:text-sm lg:text-base text-gray-300 mb-2 md:mb-3">Get the full experience on iOS</p>
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 md:gap-3 border-2 border-white rounded-lg px-3 md:px-4 py-1.5 md:py-2 hover:bg-gray-900 transition-colors"
          >
            {/* Apple Logo SVG */}
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.11-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <div className="text-white text-[10px] md:text-xs leading-tight">Download on the</div>
              <div className="text-white text-sm md:text-base font-semibold leading-tight">App Store</div>
            </div>
          </a>
        </div>

        {/* Copyright Section - Bottom Center */}
        <div className="border-t border-gray-800 pt-6 md:pt-8">
          <div className="text-center space-y-1.5 md:space-y-2 text-[10px] md:text-xs lg:text-sm text-gray-400">
            <p>© 2026 CRWD Collective. Making the world better, together.</p>
            <p>All donations are made to and gifted from CRWD Foundation</p>
            <p>EIN: 41-2423690</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
