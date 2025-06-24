import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { AvatarFallback } from '../ui/avatar';
import { AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Link } from 'react-router-dom';

const SavedHeader: React.FC = () => (
  <>
  <header className="w-full flex items-center px-4 py-3 bg-gray-50 border-b sticky top-0 z-10 md:hidden">
    <Link to="/" className="text-gray-700">
    <button className="text-gray-700">
      <ArrowLeft size={22} />
    </button>
    </Link>
    <span className="ml-4 text-gray-700 font-medium">Saved</span>
  </header>
  <header className="w-full bg-card border-b hidden p-[13.5px] md:flex items-center justify-between sticky top-0">
    <h1 className="text-xl font-bold">Saved</h1>
    <div className="flex items-center space-x-4">
      <Button variant="outline" className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        <span>Notifications</span>
      </Button>
      <div className="relative">
        <div className="absolute z-10 top-[-2] right-0 w-3 h-3 bg-destructive rounded-full"></div>
        <Avatar>
          <AvatarImage
            src="/placeholder.svg?height=40&width=40"
            alt="User"
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  </header>
  </>
);

export default SavedHeader; 