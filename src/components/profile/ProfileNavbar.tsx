import React from 'react'
import { Button } from '../ui/button'
import { Archive, Bell, ChevronLeft, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import HamburgerMenu from '../hamburgerMenu/HamburgerMenu'
import { cn } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'

export default function ProfileNavbar({ showMobileMenu = true, showDesktopMenu = true, title, titleClassName, showBackButton = true }: { showMobileMenu?: boolean, showDesktopMenu?: boolean, title?: string, titleClassName?: string, showBackButton?: boolean }) {
  const navigate = useNavigate();
  return (
    <>
      {
        showMobileMenu && (
          <header className="w-full flex items-center h-16 bg-gray-50 border-b sticky top-0 z-10 md:hidden">
            {showBackButton && (
              <ChevronLeft onClick={() => navigate(-1)} size={26} className=" absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 cursor-pointer hover:bg-gray-100 rounded-full p-1" />
            )}
            {/* Centered Logo */}
            <div className="flex-grow flex justify-center">
              <Link to="/">
                <img src="/logo3.png" width={100} height={100} alt="CRWD Logo" />
              </Link>
            </div>
            {/* Archive icon and Hamburger Menu at right */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Link to="/create-post">
                {/* <Archive strokeWidth={2} className="h-5 w-5 text-gray-700" /> */}
                <Plus strokeWidth={2} className="h-5 w-5 text-gray-700" />
              </Link>
              <HamburgerMenu />
            </div>
          </header>
        )
      }
      {showDesktopMenu && (

        <header className="w-full bg-card border-b hidden h-16 px-6 md:flex items-center justify-between z-10 sticky top-0">
          {title && <h1 className={cn("text-xl font-bold", titleClassName)}>{title}</h1>}
          <div className="flex items-center space-x-4">
            <Link to="/donation">
              <Button variant="outline" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                <span>Donation Box</span>
              </Button>
            </Link>
            {/* <Button variant="outline" className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        <span>Notifications</span>
      </Button> */}
            <div className="relative">
              <div className="absolute z-10 top-0 right-0 w-3 h-3 bg-primary rounded-full"></div>
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
      )}
    </>
  )
}
