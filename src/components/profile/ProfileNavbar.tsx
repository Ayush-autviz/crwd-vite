import React from "react";
import { Button } from "../ui/button";
import { Archive, ArrowLeft, Bell, ChevronLeft, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import HamburgerMenu from "../hamburgerMenu/HamburgerMenu";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

export default function ProfileNavbar({
  showMobileMenu = true,
  showDesktopMenu = true,
  title,
  titleClassName,
  showBackButton = true,
  showPostButton = false,
}: {
  showMobileMenu?: boolean;
  showDesktopMenu?: boolean;
  title?: string;
  titleClassName?: string;
  showBackButton?: boolean;
  showPostButton?: boolean;
}) {
  const navigate = useNavigate();
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
          {/* <div className="absolute left-1/2 transform -translate-x-1/2">
      <Link to="/">
        <img src="/logo3.png" width={80} height={80} alt="CRWD Logo" />
      </Link>
    </div> */}

          {/* Right Section */}
          {/* {!showBackButton && (
      <div className="flex items-center gap-2">
        <Link
          to="/claim-profile"
          className="text-white bg-red-600 px-2 text-sm py-1 rounded-md"
        >
          Log In
        </Link>
        <HamburgerMenu />
      </div>
    )} */}
        </header>
      )}

      {showMobileMenu && title === "Home" && (
        <header className="w-full flex items-center justify-between  px-2 py-4 border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10 md:hidden">
          {/* Logo on the left */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                src="/logo3.png"
                width={70}
                height={70}
                alt="CRWD Logo"
                className="object-contain"
              />
            </Link>
          </div>

          {/* Search bar in the center */}
          <div className="flex-1 mx-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Find nonprofits"
                className="w-full bg-gray-100 rounded-lg px-4 py-2 text-xs cursor-pointer"
                onClick={() => navigate("/search")}
                readOnly
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer"
                onClick={() => navigate("/search")}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2">
            <Link
              to="/claim-profile"
              className="text-white bg-red-600 px-2 text-sm py-1 rounded-md"
            >
              Log In
            </Link>
            <HamburgerMenu />
          </div>
        </header>
      )}

      {showDesktopMenu && (
        <header className="w-full bg-card border-b hidden h-16 px-6 md:flex items-center justify-between z-10 sticky top-0">
          {title && (
            <h1 className={cn("text-xl font-bold", titleClassName)}>{title}</h1>
          )}
          <div className="flex items-center space-x-4">
            {/* <Link to="/donation">
              <Button variant="outline" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                <span>Donation Box</span>
              </Button>
            </Link> */}
            {/* <Button variant="outline" className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        <span>Notifications</span>
      </Button> */}
            <div className="relative">
              <div className="absolute z-10 top-0 right-0 w-3 h-3 bg-primary rounded-full"></div>
              <Link to="/profile">
                <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage
                    src="/placeholder.svg?height=40&width=40"
                    alt="User"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>
      )}
    </>
  );
}
