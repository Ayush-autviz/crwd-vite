import { Button } from "../ui/button";
import { ChevronLeft, Bell, Settings, Search, Users, Mail, LogOut, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/store";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/services/api/notification";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState, useEffect } from "react";
import NewLogo from "@/assets/newLogo";


interface ProfileNavbarProps {
  readonly showMobileMenu?: boolean;
  readonly showDesktopMenu?: boolean;
  readonly title?: string;
  readonly titleClassName?: string;
  readonly showBackButton?: boolean;
  readonly showDesktopBackButton?: boolean;
  readonly showPostButton?: boolean;
  readonly backPath?: string;
}

export default function ProfileNavbar({
  showMobileMenu = true,
  showDesktopMenu = true,
  title,
  titleClassName,
  showBackButton = true,
  showDesktopBackButton = false,
  showPostButton = false,
  backPath,
}: ProfileNavbarProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { token, user, logout } = useAuthStore();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (open) {
      // mount the modal
      setIsVisible(true);
      setIsAnimating(false);
      timer = setTimeout(() => setIsAnimating(true), 20);
    } else if (isVisible) {
      // start closing animation
      setIsAnimating(false);
      timer = setTimeout(() => setIsVisible(false), 300); // must match transition duration
    }

    return () => clearTimeout(timer);
  }, [open, isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setOpen(false);
    }, 300);
  };

  const { data: unreadCount } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
    enabled: !!token?.access_token,
  });

  const handleLogout = () => {
    logout();
    navigate("/onboarding");
    setOpen(false);
  };

  const getUserInitials = () => {
    // if (user?.first_name && user?.last_name) {
    //   return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    // }
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  console.log('color', user?.color);



  return (
    <>
      {showMobileMenu && title !== "Home" && (
        <header className="w-full flex items-center justify-between h-16 px-3 bg-gray-50 border-b sticky top-0 z-10 md:hidden">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={() => backPath ? navigate(backPath) : navigate(-1)}
                className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-2 cursor-pointer"
                aria-label="Go back"
              >
                {/* <ArrowLeft size={18} /> */}
                <ChevronLeft size={18} />
              </button>
            )}
            {title && (
              <div className="flex flex-col">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 tracking-tight">
                  {title}
                </h1>
              </div>
            )}
          </div>

          {showPostButton && (
            <Link to="/create-post">
              <Button variant="outline" className="px-4">
                Post Something
              </Button>
            </Link>
          )}

          {/* Center Section (optional logo) */}

          {/* Right Section */}
        </header>
      )}

      {showMobileMenu && title === "Home" && (
        <header className="w-full flex items-center justify-between px-2.5 py-4 border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10 md:hidden">
          {/* Logo on the left */}
          <div className="flex-shrink-0">
            <Link to="/waitlist">
              {/* <NewLogo /> */}
              <img src="/icons/FullLogo.png" alt="" width={80} height={80} />
            </Link>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2.5">
            {/* <button
              onClick={() => navigate("/waitlist")}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Waitlist
            </button> */}
            {token?.access_token && (
              <>
                <Link to="/search">
                  <button className="p-1.5 rounded-full">
                    <Search size={20} className="text-gray-900" />
                  </button>
                </Link>
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-1.5  rounded-full"
                >
                  <Bell size={20} className="text-gray-900" />
                  {unreadCount?.data > 0 && (
                    <div className="absolute -top-0.5 -right-1.5  rounded-lg min-w-[16px] h-4 flex items-center justify-center px-1">
                      <span className="text-white text-[10px] font-bold">{unreadCount?.data}</span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setOpen(true)}
                  className="p-0 cursor-pointer"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profile_picture} />
                    <AvatarFallback className="text-white font-bold text-[10px] md:text-sm" style={{ backgroundColor: user?.color }}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>
                {isVisible && (
                  <div
                    className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
                      }`}
                    onClick={handleClose}
                  >
                    <div
                      className={`bg-white rounded-t-3xl w-full max-h-[70vh] sm:max-h-[80vh] overflow-y-auto transform transition-transform duration-300 ${isAnimating ? "translate-y-0" : "translate-y-full"
                        }`}
                      style={{
                        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Scroll indicator */}
                      <div className="flex justify-center pt-2 pb-1 sticky top-0 bg-white z-10">
                        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                      </div>

                      {/* User Profile Section */}
                      <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-6 border-b">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                            <AvatarImage src={user?.profile_picture} />
                            <AvatarFallback className="bg-[#1600ff] text-white">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900">
                              {user?.first_name && user?.last_name
                                ? `${user.first_name} ${user.last_name}`
                                : user?.username || "User"}
                            </h3>

                            <Link
                              to="/profile"
                              onClick={handleClose}
                              className="text-[#1600ff] text-xs sm:text-sm"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-1">
                        <Link
                          to="/circles"
                          onClick={handleClose}
                          className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                          <span className="text-gray-900 font-medium text-sm sm:text-base">Collectives</span>
                        </Link>
                        <Link
                          to="/donation"
                          onClick={handleClose}
                          className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                          <span className="text-gray-900 font-medium text-sm sm:text-base">Donation Box</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={handleClose}
                          className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                          <span className="text-gray-900 font-medium text-sm sm:text-base">Settings</span>
                        </Link>
                      </div>

                      {/* Separator */}
                      <div className="border-t border-gray-200 mx-4 sm:mx-6"></div>

                      {/* Log Out Section */}
                      <div className="px-4 sm:px-6 m-4 sm:m-6 rounded-lg py-3 sm:py-4 border border-gray-200 flex items-center justify-center">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="font-medium text-sm sm:text-base">Log Out</span>
                          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {!token?.access_token && (
              <Link
                to="/onboarding"
                className="text-white bg-red-600 px-2 text-sm py-1 rounded-md"
              >
                Log In
              </Link>
            )}
          </div>
        </header>
      )}

      {showDesktopMenu && title === "Home" && (
        <header className="w-full items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10 hidden md:flex">
          {/* Logo on the left */}
          {/* <div className="flex-shrink-0">
            <Link to="/waitlist">
              <img
                src="/logo3.png"
                width={70}
                height={60}
                alt="CRWD Logo"
                className="object-contain"
              />
            </Link>
          </div> */}

          {/* <NewLogo /> */}
          <img src="/icons/FullLogo.png" width={100} height={100} alt="CRWD Logo" className="object-contain" />

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2.5">
            {/* <button
              onClick={() => navigate("/waitlist")}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Waitlist
            </button> */}
            {token?.access_token && (
              <>
                <Link to="/search">
                  <Search size={20} className="text-gray-900" />
                </Link>
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-1.5 rounded-full"
                >
                  <Bell size={20} className="text-gray-900" />
                  {unreadCount?.data > 0 && (
                    <div className="absolute -top-0.5 -right-1.5 rounded-lg min-w-[16px] h-4 flex items-center justify-center px-1">
                      <span className="text-white text-[10px] font-bold">{unreadCount?.data}</span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setOpen(true)}
                  className="p-0 cursor-pointer"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profile_picture} />
                    <AvatarFallback className={`text-white font-bold text-[10px] md:text-sm`} style={{ backgroundColor: user?.color }}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>
                {isVisible && (
                  <div
                    className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
                      }`}
                    onClick={handleClose}
                  >
                    <div
                      className={`bg-white rounded-t-3xl w-full max-h-[70vh] sm:max-h-[80vh] overflow-y-auto transform transition-transform duration-300 ${isAnimating ? "translate-y-0" : "translate-y-full"
                        }`}
                      style={{
                        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Scroll indicator */}
                      <div className="flex justify-center pt-2 pb-1 sticky top-0 bg-white z-10">
                        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                      </div>

                      {/* User Profile Section */}
                      <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-6 border-b">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                            <AvatarImage src={user?.profile_picture} />
                            <AvatarFallback
                              className="text-white font-bold text-[10px] md:text-sm"
                              style={{ backgroundColor: user?.color }}>
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900">
                              {user?.first_name && user?.last_name
                                ? `${user.first_name} ${user.last_name}`
                                : user?.username || "User"}
                            </h3>

                            <Link
                              to="/profile"
                              onClick={handleClose}
                              className="text-[#1600ff] text-xs sm:text-sm"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-1">
                        <Link
                          to="/circles"
                          onClick={handleClose}
                          className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                          <span className="text-gray-900 font-medium text-sm sm:text-base">Collectives</span>
                        </Link>
                        <Link
                          to="/donation"
                          onClick={handleClose}
                          className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                          <span className="text-gray-900 font-medium text-sm sm:text-base">Donation Box</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={handleClose}
                          className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                          <span className="text-gray-900 font-medium text-sm sm:text-base">Settings</span>
                        </Link>
                      </div>

                      {/* Separator */}
                      <div className="border-t border-gray-200 mx-4 sm:mx-6"></div>

                      {/* Log Out Section */}
                      <div onClick={handleLogout} className="px-4 sm:px-6 m-4 sm:m-6 rounded-lg py-3 sm:py-4 border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center">
                        <button

                          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="font-medium text-sm sm:text-base">Log Out</span>
                          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}


              </>
            )}
            {!token?.access_token && (
              <Link
                to="/onboarding"
                className="text-white bg-red-600 px-2 text-sm py-1 rounded-md"
              >
                Log In
              </Link>
            )}
          </div>
        </header>
      )}

      {showDesktopMenu && title !== "Home" && (
        <header className="w-full bg-card border-b hidden h-16 px-6 md:flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {showDesktopBackButton && (
              <button
                onClick={() => backPath ? navigate(backPath) : navigate(-1)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {title && (
              <h1 className={cn("text-xl font-bold", titleClassName)}>{title}</h1>
            )}
          </div>
          {/* <div className="flex items-center space-x-4">
            <div className="relative">
              <HamburgerMenu />
              <div className="absolute z-10 top-0 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div> */}
        </header>
      )}
    </>
  );
}
