import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu as MenuIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NavigationItems from "./NavigationItems";
import { useAuthStore } from "@/stores/store";


const HamburgerMenu: React.FC = () => {
  
  const { user: currentUser } = useAuthStore();
  return (
  <div className="">
    <Sheet>
      <SheetTrigger asChild>
        <MenuIcon size={32} className="text-black" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="p-0 w-[90vw] max-w-[320px] border-l shadow-lg"
      >
        {/* Profile */}
        <div className="flex justify-between p-4 ">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                // src="https://randomuser.me/api/portraits/women/44.jpg"
                src={currentUser?.profile_picture}
                alt="Profile"
              />
              <AvatarFallback>{currentUser?.first_name ? currentUser?.first_name?.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
        {currentUser?.id ? (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">My Name is {currentUser?.first_name}</span>
              <Link
                to="/profile"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Go to your profile
              </Link>
            </div>
            ):(
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Guest</span>
                <Link
                  to="/login"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Login
                </Link>
              </div>
            )
          }
          </div>
          {currentUser?.id && (
          <div className="p-2 relative">
            <Bell size={22} />
            <div className="absolute top-0 -right-1 text-xs px-1 text-white bg-red-500 rounded-full">
              5
            </div>
          </div>
          )}
        </div>
        {/* Menu List */}
        <NavigationItems />

        <div className="mt-auto border-t">
          <div className="flex justify-center gap-4 p-4">
            <Link to="/settings/privacy" className="text-xs text-primary">
              Privacy Policy
            </Link>
            <Link to="/settings/terms" className="text-xs text-primary">
              Terms of Service
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center mb-2">
            CRWD ©2025
          </p>
        </div>
      </SheetContent>
    </Sheet>
  </div>
  );
};

export default HamburgerMenu;
