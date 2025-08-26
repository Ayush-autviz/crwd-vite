import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu as MenuIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NavigationItems from "./NavigationItems";

const HamburgerMenu: React.FC = () => (
  <div className="md:hidden">
    <Sheet>
      <SheetTrigger asChild className="p-2">
        <MenuIcon size={42} className="text-black" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="p-0 w-[90vw] max-w-[320px] border-l shadow-lg"
      >
        {/* Profile */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Profile"
            />
            <AvatarFallback>MY</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">My Name is Mya</span>
            <Link
              to="/profile"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Go to your profile
            </Link>
          </div>
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

export default HamburgerMenu;
