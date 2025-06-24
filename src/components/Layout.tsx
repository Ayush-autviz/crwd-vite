import { useLocation, Link } from 'react-router-dom'
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
  const location = useLocation()
  const isAuthPage = location.pathname?.startsWith('/signup') || 
                     location.pathname?.startsWith('/login') || 
                     location.pathname?.startsWith('/forgot-password') || 
                     location.pathname?.startsWith('/interests') || 
                     location.pathname?.startsWith('/verify')

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
      {!isAuthPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t flex justify-around py-3 mx-auto z-10 md:hidden bg-gray-50">
          <Link
            className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            to={"/"}
          >
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs ">Home</span>
            </Button>
          </Link>
          <Link
            className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            to={"/search"}
          >
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            >
              <Search className="h-5 w-5" />
              <span className="text-xs ">Search</span>
            </Button>
          </Link>
          <Link
            className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            to={"/donation"}
          >
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            >
              <Archive className="h-5 w-5" />
              <span className="text-xs ">Donation</span>
            </Button>
          </Link>
          <Link
            className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            to={"/notifications"}
          >
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="text-xs ">Activity</span>
            </Button>
          </Link>
          <Link
            className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            to={"/profile"}
          >
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-0 flex-1 text-muted-foreground"
            >
              <User className="h-5 w-5" />
              <span className="text-xs ">Profile</span>
            </Button>
          </Link>
        </nav>
      )}
    </>
  );
}
