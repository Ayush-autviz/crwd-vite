import { useLocation, Link } from "react-router-dom";
import {
  Home,
  Search,
  Box,
  User,
  Bell,
  Settings,
  Users,
  TrendingUp,
  Calendar,
  Menu,
  ArrowLeft,
  ArrowRightLeft,
  Heart,
  Plus,
  Archive,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import DesktopNavigation from "@/components/hamburgerMenu/DesktopNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAuthPage =
    location.pathname?.startsWith("/signup") ||
    location.pathname?.startsWith("/login") ||
    location.pathname?.startsWith("/forgot-password") ||
    location.pathname?.startsWith("/interests") ||
    location.pathname?.startsWith("/verify");

  return (
    <>
      {/* Desktop Sidebar - Only visible on md screens and NOT on auth pages */}
      {!isAuthPage && (
        <div className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-72 md:flex-col md:border-r md:bg-card">
          <div className="flex h-16 items-center justify-center px-6 py-6 border-b">
            <Link to="/">
              <img
                src="/logo3.png"
                width={100}
                height={100}
                alt="Picture of the author"
              />
            </Link>
          </div>
          <DesktopNavigation />
        </div>
      )}

      {/* Main Content with Mobile and Desktop Views */}
      <div className={isAuthPage ? "" : "md:pl-72"}>
        {/* Mobile Content */}
        <div className="md:hidden no-scrollbar">
          {/* Main Content */}
          {children}
        </div>

        {/* Desktop Content */}
        <div className="hidden md:block">
          {/* Main Content */}
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only show if NOT on auth pages */}
      {/* {!isAuthPage && ( */}
      {false && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-t-1 border-t-gray-500 flex justify-around py-3 mx-auto z-10 md:hidden bg-gray-50">
          <Link
            className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            to={"/"}
          >
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            >
              {/* <Home className="h-5 w-5" color={location.pathname === '/' ? 'black' : 'gray'} /> */}
              <img
                src={
                  location.pathname === "/"
                    ? "icons/home-fill.png"
                    : "/icons/home.png"
                }
                alt="Home"
                className="w-5 h-4.8"
              />
              <span
                className={`text-xs ${
                  location.pathname === "/" ? "text-black" : "text-gray-500"
                }`}
              >
                Home
              </span>
            </Button>
          </Link>
          {/* <Link
            className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            to={"/search"}
          >
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            >
              <img
                src={
                  location.pathname === "/search"
                    ? "icons/search-fill.png"
                    : "/icons/search.png"
                }
                alt="Search"
                className="w-5 h-5"
              />
              <span
                className={`text-xs ${
                  location.pathname === "/search"
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                Search
              </span>
            </Button>
          </Link> */}
          <Link
            className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            to={"/donation"}
          >
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            >
              {/* <Archive className="h-5 w-5" color={location.pathname === '/donation' ? 'black' : 'gray'} /> */}
              <img
                src={
                  location.pathname === "/donation"
                    ? "icons/box-fill.png"
                    : "/icons/box.png"
                }
                alt="Donation"
                className="w-5 h-5"
              />
              <span
                className={`text-xs ${
                  location.pathname === "/donation"
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                My Giving
              </span>
            </Button>
          </Link>
          {/* <Link
            className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            to={"/notifications"}
          >
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            >
              <img
                src={
                  location.pathname === "/notifications"
                    ? "icons/bell-fill.png"
                    : "/icons/bell.png"
                }
                alt="Notifications"
                className={`${
                  location.pathname === "/notifications"
                    ? "w-[22px] h-[20px]"
                    : "w-5 h-5"
                }`}
              />
              <span
                className={`text-xs ${
                  location.pathname === "/notifications"
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                Activity
              </span>
            </Button>
          </Link> */}
          <Link
            className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            to={"/profile"}
          >
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            >
              {/* <User className="h-5 w-5" color={location.pathname === '/profile' ? 'black' : 'gray'} /> */}
              <img
                src={
                  location.pathname === "/profile"
                    ? "icons/user-fill.png"
                    : "/icons/user.png"
                }
                alt="Profile"
                className="w-5 h-5"
              />
              <span
                className={`text-xs ${
                  location.pathname === "/profile"
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                Me
              </span>
            </Button>
          </Link>
        </nav>
      )}
    </>
  );
}
