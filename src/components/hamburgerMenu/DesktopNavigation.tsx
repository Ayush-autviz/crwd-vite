import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationItems from './NavigationItems';

const DesktopNavigation: React.FC = () => (
  <div className="hidden md:flex flex-col h-screen w-72 border-r bg-background">
    {/* Scrollable Content - Everything */}
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {/* Profile Section */}
        <div className="flex items-center gap-3 p-4 ">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Profile"
            />
            <AvatarFallback>MY</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">My Name is Mya</span>
            <Link to="/profile" className="text-xs text-muted-foreground hover:text-primary">
              Go to your profile
            </Link>
          </div>
        </div>

        {/* Navigation Links */}

        <NavigationItems
          className=""
          linkClassName="gap-4"
          showNewPostButton={true}
        />


        {/* Footer Links */}
        <div className="border-t mt-auto">
          <div className="flex gap-4 p-4">
            <Link to="/settings/privacy" className="text-xs text-primary hover:underline">Privacy Policy</Link>
            <Link to="/settings/terms" className="text-xs text-primary hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
);

export default DesktopNavigation; 