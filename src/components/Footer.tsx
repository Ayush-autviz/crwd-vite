import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Logo at Top */}
        <div className="mb-6">
          <div className="text-2xl md:text-3xl font-bold">crwd</div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-gray-800 mb-8"></div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {/* Platform Column */}
          <div>
            <h3 className="font-bold text-base md:text-lg mb-4">Platform</h3>
            <nav className="space-y-2">
              <Link
                to="/search"
                className="block text-white hover:text-gray-300 transition-colors text-sm md:text-base"
              >
                Find Nonprofits
              </Link>
              <Link
                to="/create-crwd"
                className="block text-white hover:text-gray-300 transition-colors text-sm md:text-base"
              >
                Create a CRWD
              </Link>
              <Link
                to="/circles"
                className="block text-white hover:text-gray-300 transition-colors text-sm md:text-base"
              >
                Browse Giving Groups
              </Link>
            </nav>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-bold text-base md:text-lg mb-4">Resources</h3>
            <nav className="space-y-2">
              <Link
                to="/settings/about"
                className="block text-white hover:text-gray-300 transition-colors text-sm md:text-base"
              >
                How it works
              </Link>
              <Link
                to="/articles"
                className="block text-white hover:text-gray-300 transition-colors text-sm md:text-base"
              >
                What is a CRWD collective?
              </Link>
              <Link
                to="/settings/help"
                className="block text-white hover:text-gray-300 transition-colors text-sm md:text-base"
              >
                FAQs
              </Link>
            </nav>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-bold text-base md:text-lg mb-4">Support</h3>
            <nav className="space-y-2">
              <Link
                to="/settings/help"
                className="block text-white hover:text-gray-300 transition-colors text-sm md:text-base"
              >
                Help Center
              </Link>
              <Link
                to="/settings/report"
                className="block text-white hover:text-gray-300 transition-colors text-sm md:text-base"
              >
                Contact Us
              </Link>
              <Link
                to="/settings/privacy"
                className="block text-white hover:text-gray-300 transition-colors text-sm md:text-base"
              >
                Privacy Policy
              </Link>
              <Link
                to="/settings/terms"
                className="block text-white hover:text-gray-300 transition-colors text-sm md:text-base"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        {/* App Download Section - Left Side */}
        <div className="mb-12">
          <p className="text-sm md:text-base text-gray-300 mb-3">Get the full experience on iOS</p>
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border-2 border-white rounded-lg px-4 py-2 hover:bg-gray-900 transition-colors"
          >
            {/* Apple Logo SVG */}
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.11-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <div className="text-white text-xs leading-tight">Download on the</div>
              <div className="text-white text-base font-semibold leading-tight">App Store</div>
            </div>
          </a>
        </div>

        {/* Copyright Section - Bottom Center */}
        <div className="border-t border-gray-800 pt-8">
          <div className="text-center space-y-2 text-xs md:text-sm text-gray-400">
            <p>© 2025 CRWD Collective. Making the world better, together.</p>
            <p>All donations are made to and gifted from CRWD Foundation</p>
            <p>EIN: 41-2423690</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
