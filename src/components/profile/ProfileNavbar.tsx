import { Button } from "../ui/button";
import { ChevronLeft, Bell, Settings } from "lucide-react";
import HamburgerMenu from "../hamburgerMenu/HamburgerMenu";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/store";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/services/api/notification";


interface ProfileNavbarProps {
  readonly showMobileMenu?: boolean;
  readonly showDesktopMenu?: boolean;
  readonly title?: string;
  readonly titleClassName?: string;
  readonly showBackButton?: boolean;
  readonly showDesktopBackButton?: boolean;
  readonly showPostButton?: boolean;
}

export default function ProfileNavbar({
  showMobileMenu = true,
  showDesktopMenu = true,
  title,
  titleClassName,
  showBackButton = true,
  showDesktopBackButton = false,
  showPostButton = false,
}: ProfileNavbarProps) {
  const navigate = useNavigate();

const {token} = useAuthStore();

  const { data: unreadCount } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
    enabled: !!token?.access_token,
  });

  
  return (
    <>
      {showMobileMenu && title !== "Home" && (
        <header className="w-full flex items-center justify-between h-16 px-3 bg-gray-50 border-b sticky top-0 z-10 md:hidden">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-2 cursor-pointer"
                aria-label="Go back"
              >
                {/* <ArrowLeft size={18} /> */}
                <ChevronLeft size={18} />
              </button>
            )}
            {title && (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">
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
            <Link to="/">
              <img
                src="/logo3.png"
                width={70}
                height={60}
                alt="CRWD Logo"
                className="object-contain"
              />
            </Link>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2.5">
            {token?.access_token && (
              <>
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-1.5 bg-red-50 rounded-full"
                >
                  <Bell size={20} className="text-gray-900" />
                  {unreadCount?.data > 0 && (
                    <div className="absolute -top-0.5 -right-1.5 bg-red-500 rounded-lg min-w-[16px] h-4 flex items-center justify-center px-1">
                      <span className="text-white text-[10px] font-bold">{unreadCount?.data}</span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="p-1"
                >
                  <Settings size={24} className="text-gray-900" />
                </button>
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
        <header className="w-full flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10 hidden md:flex">
          {/* Logo on the left */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                src="/logo3.png"
                width={70}
                height={60}
                alt="CRWD Logo"
                className="object-contain"
              />
            </Link>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2.5">
            {token?.access_token && (
              <>
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-1.5 bg-red-50 rounded-full"
                >
                  <Bell size={20} className="text-gray-900" />
                  {unreadCount?.data > 0 && (
                    <div className="absolute -top-0.5 -right-1.5 bg-red-500 rounded-lg min-w-[16px] h-4 flex items-center justify-center px-1">
                      <span className="text-white text-[10px] font-bold">{unreadCount?.data}</span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="p-1"
                >
                  <Settings size={24} className="text-gray-900" />
                </button>
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
                onClick={() => navigate(-1)}
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
          <div className="flex items-center space-x-4">
            <div className="relative">
              <HamburgerMenu />
              <div className="absolute z-10 top-0 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </header>
      )}
    </>
  );
}
