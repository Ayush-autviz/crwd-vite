    import { useEffect, useState } from 'react'
    import { Button } from './ui/button'
    import { Card, CardContent } from './ui/card'
    import { ChevronRight, Search, Menu, Users, CheckSquare, Settings, LogIn, X } from 'lucide-react';
    import { useNavigate, Link } from 'react-router-dom';
    import AutomaticImpact from './guest/AutomaticImpact';
    import PopularCollectives from './guest/PopularCollectives';
    import LearnAndGetInspired from './guest/LearnAndGetInspired';
    import CommunityTestimonials from './guest/CommunityTestimonials';
    import StartMakingDifference from './guest/StartMakingDifference';
    import Footer from './Footer';
    import { NewLogo } from '@/assets/newLogo';

    // Define two sets of causes with their styling
    const causeSets = [
        [
            { name: "refugees", bgColor: "bg-slate-400", hoverColor: "hover:bg-slate-500" },
            { name: "sanctuaries", bgColor: "bg-purple-300", hoverColor: "hover:bg-purple-400" },
            { name: "veteran housing", bgColor: "bg-green-300", hoverColor: "hover:bg-green-400" },
            { name: "pediatric care", bgColor: "bg-orange-300", hoverColor: "hover:bg-orange-400" },
        ],
        [
            { name: "food banks", bgColor: "bg-slate-400", hoverColor: "hover:bg-slate-500" },
            { name: "animal shelters", bgColor: "bg-purple-300", hoverColor: "hover:bg-purple-400" },
            { name: "homeless shelters", bgColor: "bg-green-300", hoverColor: "hover:bg-green-400" },
            { name: "cancer research", bgColor: "bg-orange-300", hoverColor: "hover:bg-orange-400" },
        ],
        [
            { name: "disaster relief", bgColor: "bg-slate-400", hoverColor: "hover:bg-slate-500" },
            { name: "wildlife rescue", bgColor: "bg-purple-300", hoverColor: "hover:bg-purple-400" },
            { name: "affordable housing", bgColor: "bg-green-300", hoverColor: "hover:bg-green-400" },
            { name: "mental health", bgColor: "bg-orange-300", hoverColor: "hover:bg-orange-400" },
        ]
    ];


    export default function GuestHome() {
        const navigate = useNavigate()
        const [donationAmount, setDonationAmount] = useState(5) // Default $35/month
        const [currentCauseSet, setCurrentCauseSet] = useState(0)
        const [menuOpen, setMenuOpen] = useState(false)
        const [isVisible, setIsVisible] = useState(false)
        const [isAnimating, setIsAnimating] = useState(false)
        const [showAppBanner, setShowAppBanner] = useState(true)

        // Rotate cause sets every 3 seconds
        useEffect(() => {
            const interval = setInterval(() => {
                setCurrentCauseSet((prev) => (prev + 1) % causeSets.length);
            }, 3000);

            return () => clearInterval(interval);
        }, []);

        // Handle bottom sheet menu animations
        useEffect(() => {
            let timer: NodeJS.Timeout;

            if (menuOpen) {
                setIsVisible(true);
                setIsAnimating(false);
                timer = setTimeout(() => setIsAnimating(true), 20);
            } else if (isVisible) {
                setIsAnimating(false);
                timer = setTimeout(() => setIsVisible(false), 300);
            }

            return () => clearTimeout(timer);
        }, [menuOpen, isVisible]);

        const handleCloseMenu = () => {
            setIsAnimating(false);
            setTimeout(() => {
                setMenuOpen(false);
            }, 300);
        };

        return (
            <div className="min-h-screen bg-background ">


                {/* Navbar */}
                <div className="sticky top-0 z-10 w-full flex items-center justify-between px-2 py-2.5 sm:p-4 md:px-6 border-b bg-background">
                    {/* Logo with colored circles */}
                    
                    <Link to="/waitlist" className="flex-shrink-0">
                        <NewLogo size="sm" />
                    </Link>

                    
                    {/* Right side buttons */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                        {/* Search Icon */}
                        <button
                            onClick={() => navigate("/search")}
                            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                            aria-label="Search"
                        >
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
                        </button>

                        {/* Sign In Button */}
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-[#ff3366] hover:bg-[#ff0033] text-white font-bold px-2 py-1 sm:px-3 sm:py-1.5 md:px-6 md:py-2 rounded-full text-[10px] xs:text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                            Sign In
                        </button>

                        {/* Get the App Button
                        <button
                            className="border-[#1600ff] border text-[#1600ff] hover:bg-[#1600ff] hover:text-white font-bold px-2 py-0.5 sm:px-3 rounded-full text-[10px] xs:text-xs sm:text-sm md:text-base md:hidden whitespace-nowrap"
                        >
                            Get the App
                        </button> */}

                        {/* Hamburger Menu */}
                        <button 
                            onClick={() => setMenuOpen(true)}
                            className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                            aria-label="Menu"
                        >
                            <Menu className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-9 lg:w-9 text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="bg-card pt-4 pb-8 md:pt-8 md:pb-16 px-4 md:px-6">
                    {/* Launch Banner */}
                    <div className="max-w-4xl mx-auto text-center mt-6 md:mt-20 mb-4 md:mb-8">


                        <h1 className="font-[900] text-foreground mb-2 md:mb-4 leading-tight" style={{ fontSize: 'clamp(1.5rem, 5vw, 4.5rem)' }}>
                            Stop Wishing You Made a Difference.
                            <span className="text-[#1600ff]"> Start Being Someone Who Does.</span>
                        </h1>

                        <p className="text-muted-foreground mb-4 md:mb-8 max-w-2xl mx-auto text-sm md:text-base" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1.5rem)' }}>
                            What if you could support every cause you care about automatically, affordably, and powerfully?
                        </p>

                        <Button
                            onClick={() => navigate("/onboarding")}
                            className="h-10 md:h-14 px-6 md:px-10 py-2 md:py-4 rounded-lg bg-[#1600ff] text-white font-bold text-sm md:text-lg"
                        >
                            Get started
                        </Button>

                    </div>
                </div>

                {/* See the Magic in Action Section */}
                <div className="bg-gradient-to-br from-[#f1f6ff] via-[#f7f6ff] to-[#fdf3f8] py-6 md:py-16 px-4 md:px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-[800] text-foreground mb-2 md:mb-4 text-center text-lg md:text-2xl" style={{ fontSize: 'clamp(1rem, 3vw, 2.5rem)' }}>
                            See the <span className="text-[#1600ff]">Magic</span> in Action
                        </h2>
                        <p className="text-muted-foreground mb-4 md:mb-12 text-center text-xs md:text-base" style={{ fontSize: 'clamp(0.7rem, 1.5vw, 1.25rem)' }}>
                            Pick your causes. Give once. Multiply your impact.
                        </p>

                        {/* Demo Card */}
                        <Card className="max-w-[90%] md:max-w-[80%] lg:max-w-3xl mx-auto">
                            <CardContent className="p-3 md:p-8 lg:p-12">
                                <div className="text-gray-500 mb-3 md:mb-4 text-center text-xs md:text-base" style={{ fontSize: 'clamp(0.65rem, 1.5vw, 1.125rem)' }}>
                                    You can give <span className="text-[#1600ff] font-[900]" style={{ fontSize: 'clamp(1.25rem, 4vw, 3rem)' }}>${donationAmount}</span>/month to
                                </div>

                                {/* Slider */}
                                <div className="mb-3 md:mb-6 relative">
                                    <input
                                        type="range"
                                        min="5"
                                        max="100"
                                        step="5"
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(Math.round(Number(e.target.value) / 5) * 5)}
                                        className="w-full h-2 md:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 md:[&::-webkit-slider-thumb]:w-5 md:[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#fff] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1600ff] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 md:[&::-moz-range-thumb]:w-5 md:[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1600ff] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
                                        style={{
                                            background: `linear-gradient(to right, #1600ff 0%, #1600ff ${((donationAmount - 5) / 95) * 100}%, #e5e7eb ${((donationAmount - 5) / 95) * 100}%, #e5e7eb 100%)`
                                        }}
                                    />
                                </div>

                                {/* Cause Buttons */}
                                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-1.5 md:gap-3 mb-3 md:mb-6 justify-center">
                                    {causeSets[currentCauseSet].map((cause) => (
                                        <button
                                            key={`${cause.name}-${currentCauseSet}`}
                                            className={`px-1.5 py-0.5 md:px-4 md:py-2 rounded-full text-primary-foreground text-[10px] md:text-sm lg:text-base font-medium ${cause.bgColor} ${cause.hoverColor} transition-colors`}
                                        >
                                            {cause.name}
                                        </button>
                                    ))}
                                </div>

                                <div className="font-bold text-[#1600ff] mb-2 md:mb-4 text-center text-xs md:text-base" style={{ fontSize: 'clamp(0.7rem, 2vw, 1.25rem)' }}>
                                    <span className="font-[700]" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.875rem)' }}>= ${donationAmount * 12}</span> /year of impact
                                </div>

                                {/* Distribution Bar */}
                                <div className="flex h-2 md:h-4 rounded-full overflow-hidden mb-2 md:mb-4">
                                    <div className="bg-pink-500 flex-1" />
                                    <div className="bg-orange-500 flex-1" />
                                    <div className="bg-green-500 flex-1" />
                                    <div className="bg-[#1600ff] flex-1" />
                                </div>

                                <p className="text-gray-700 mb-4 md:mb-8 text-center font-[600] mt-3 md:mt-6 text-xs md:text-base" style={{ fontSize: 'clamp(0.65rem, 1.5vw, 1rem)' }}>
                                    One gift. Multiple causes.
                                </p>

                                <Button
                                    onClick={() => navigate("/waitlist")}
                                    className="w-full h-9 md:h-12 rounded-full font-bold text-xs md:text-base lg:text-lg px-6 md:px-10 py-2 md:py-4 bg-[#1600ff] text-white"
                                >
                                    Start Supporting <ChevronRight className="ml-1.5 md:ml-2 h-3.5 w-3.5 md:h-5 md:w-5" />
                                </Button>
                                <p className="text-gray-500 text-center mt-3 md:mt-4 text-xs md:text-base" style={{ fontSize: 'clamp(0.65rem, 1.5vw, 1rem)' }}>Every dollar makes a difference</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Automatic Impact Section */}
                <AutomaticImpact />

                {/* Popular Collectives Section */}
                <PopularCollectives />

                {/* Learn & Get Inspired Section */}
                <LearnAndGetInspired />

                {/* Community Testimonials Section */}
                <CommunityTestimonials />

                {/* Start Making a Difference Section */}
                <StartMakingDifference />

                {/* Footer */}
                <Footer />

                {/* Fixed iOS App Banner */}
                {showAppBanner && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 z-40 shadow-lg block sm:hidden">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
                    <NewLogo size="sm" />
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        <p className="text-xs xs:text-sm md:text-base font-bold text-gray-900">
                        Get the full experience on iOS
                        </p>
                        <p className="text-xs xs:text-sm md:text-sm text-gray-500">
                        Easily manage all of your giving
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAppBanner(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        aria-label="Close banner"
                    >
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    </div>
                </div>
                )}

                {/* Bottom Sheet Menu */}
                {isVisible && (
                    <div
                        className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={handleCloseMenu}
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
                            <div className="flex justify-center pt-2  sticky top-0 bg-white z-10">
                                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                            </div>

                            <div className="border-t border-gray-100 mt-4"></div>


                            {/* Log In/Get Started Button */}
                            <div className="px-4 sm:px-6  pb-4 sm:pb-6">

                            </div>

                            {/* Menu Items */}
                            <div className="px-4 sm:px-6 pb-3 sm:pb-4 space-y-1">
                                <button
                                    onClick={() => {
                                        navigate("/onboarding");
                                        handleCloseMenu();
                                    }}
                                    className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                                >
                                    <LogIn className="h-4 w-4 sm:h-5 sm:w-5 text-[#1600ff] group-hover:text-white transition-colors" />
                                    <span className="text-sm sm:text-base">Log In/Get Started</span>
                                </button>

                                <div className="border-t border-gray-100 "></div>

                                <button
                                    onClick={() => {
                                        navigate("/circles");
                                        handleCloseMenu();
                                    }}
                                    className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                                >
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#1600ff]" />
                                    <span className="text-sm sm:text-base">Collectives</span>
                                </button>
                                <button
                                    onClick={() => {
                                        navigate("/donation");
                                        handleCloseMenu();
                                    }}
                                    className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                                >
                                    <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-[#1600ff]" />
                                    <span className="text-sm sm:text-base">Donation Box</span>
                                </button>
                            </div>

                            {/* Separator */}
                            <div className="border-t border-gray-100 mx-4 sm:mx-6"></div>

                            {/* Learn More */}
                            <div className="px-4 sm:px-6 py-3 sm:py-4">
                                <button
                                    onClick={() => {
                                        navigate("/waitlist");
                                        handleCloseMenu();
                                    }}
                                    className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                                >
                                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-[#1600ff]" />
                                    <span className="text-sm sm:text-base">Learn More</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }