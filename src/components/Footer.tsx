import { Link } from "react-router-dom";

const Footer = () => {
  const navigationLinks = [
    { id: 1, text: "Find Nonprofits", href: "/nonprofits" },
    { id: 2, text: "About", href: "/about" },
    { id: 3, text: "What is a CRWD collective?", href: "/collective" },
    { id: 4, text: "How it works", href: "/how-it-works" },
    { id: 5, text: "FAQs", href: "/faq" },
    { id: 6, text: "Blog", href: "/blog" },
  ];

  const socialMediaIcons = [
    {
      id: 1,
      name: "Instagram",
      icon: "icons/instagram.png",
      href: "https://instagram.com",
    },
    {
      id: 2,
      name: "LinkedIn",
      icon: "/icons/linked-in.png",
      href: "https://linkedin.com",
    },
    {
      id: 3,
      name: "TikTok",
      icon: "/icons/tiktok.png",
      href: "https://tiktok.com",
    },
  ];

  return (
    <div className=" flex items-center justify-center md:-mx-6">
      {/* Main Modal */}
      <div className="bg-black rounded-t-lg w-full relative">
        {/* Content Container */}
        <div className="p-4 md:p-8">
          <div className="flex justify-between items-start gap-4">
            {/* Navigation Links - Left Side */}
            <div className="flex-1 mb-8 lg:mb-0">
              <nav className="space-y-1">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.id}
                    to={"/"}
                    className="block text-white text-lg hover:text-gray-300 transition-colors duration-200"
                  >
                    {link.text}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Social Media Icons - Top Right */}
            <div className="flex space-x-2 mb-8 lg:mb-0">
              {socialMediaIcons.map((social) => (
                <div
                  key={social.id}
                  //   href={social.href}
                  className="w-8 h-8 rounded flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={social.icon}
                    alt={social.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* App Store Download Button - Bottom Center */}
          <div className="flex justify-center mt-4">
            <button className="bg-black border-2 border-white rounded-lg px-6 py-1 flex items-center space-x-3 hover:bg-gray-800 transition-colors duration-200">
              <div className="w-12 h-12">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.11-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white text-xs">Download on the</div>
                <div className="text-white text-lg font-bold">App Store</div>
              </div>
            </button>
          </div>
        </div>

        {/* Light Gray Footer Section */}
        <div className="bg-gray-300 px-8 py-4   ">
          <div className="flex justify-between items-center text-xs text-gray-700 font-medium">
            <div className="text-center">
              <Link
                to="/settings/terms"
                className="hover:text-black transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
            <div className="text-center">© 2025 CRWD. All rights reserved</div>
            <div className="text-center">
              <Link
                to="/settings/privacy"
                className="hover:text-gray-800 transition-colors duration-200"
              >
                Privacy policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
