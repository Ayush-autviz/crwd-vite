import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { ChevronRight, Search, Menu, Users, CheckSquare, Settings, LogIn, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AutomaticImpact from './guest/AutomaticImpact';
import ShowStandFor from './guest/ShowStandFor';
import PopularCollectives from './guest/PopularCollectives';
import LearnAndGetInspired from './guest/LearnAndGetInspired';
import CommunityTestimonials from './guest/CommunityTestimonials';
import StartMakingDifference from './guest/StartMakingDifference';
import Footer from './Footer';
import { NewLogo } from '@/assets/newLogo';
import { Check } from 'lucide-react';

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
    const [showAppBanner, setShowAppBanner] = useState(false)

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

    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="min-h-screen bg-background ">

            <div className="min-h-[100dvh] flex flex-col bg-background">

                {/* ================= NAVBAR ================= */}
                <div className="sticky top-0 z-10 w-full flex items-center justify-between h-16 px-3 border-b bg-background shrink-0">

                    {/* Logo */}
                    <img
                        src="/icons/FullLogo.png"
                        alt="CRWD Logo"
                        className="w-20 md:w-[110px] object-contain cursor-pointer"
                        onClick={handleScrollToTop}
                    />

                    {/* Right side buttons */}
                    <div className="flex items-center gap-2 md:gap-4">

                        {/* Sign In Button */}
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-[#ff3366] hover:bg-[#ff0033] text-white font-bold
                px-3 py-1.5 md:px-6 md:py-2
                rounded-full text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                            Sign In
                        </button>

                        {/* Get App Button (mobile only) */}
                        <a
                            href="https://apps.apple.com/us/app/crwd-app/id6748994882"
                            target="_blank"
                            className="border-[#1600ff] border text-[#1600ff]
                hover:bg-[#1600ff] hover:text-white font-bold
                px-3 py-1.5 rounded-full
                text-xs sm:text-sm md:hidden whitespace-nowrap"
                        >
                            Get the App
                        </a>

                    </div>
                </div>

                {/* ================= CONTENT AREA ================= */}
                <div className="flex flex-col flex-1 min-h-0">

                    {/* ================= HERO SECTION ================= */}
                    <div
                        className="
            bg-card
            flex-1
            flex
            items-center
            justify-center
            px-4 md:px-6
            py-0 md:py-12
            pb-[env(safe-area-inset-bottom)]
        "
                    >
                        <div className="max-w-4xl mx-auto text-center">

                            {/* HERO HEADING */}
                            <h1
                                className="
                        font-black
                        leading-[1.05]
                        tracking-tight
                        mb-6
                        text-[clamp(2.5rem,8vw,4.2rem)]
                    "
                            >
                                One monthly donation.
                                <span className="text-[#1600ff] block md:inline">
                                    {" "}Every nonprofit you care about.
                                </span>
                            </h1>

                            {/* SUBTEXT */}
                            <p
                                className="
                        text-muted-foreground
                        mx-auto
                        mb-10
                        max-w-2xl
                        leading-relaxed
                        text-[clamp(1.15rem,2.4vw,1.4rem)]
                    "
                            >
                                Discover nonprofits worth supporting. Give to all of them.
                            </p>

                            {/* CTA BUTTON */}
                            <Button
                                onClick={() => navigate("/onboarding")}
                                className="
                        h-14
                        px-12
                        rounded-lg
                        bg-[#1600ff]
                        text-white
                        font-bold
                        text-lg md:text-xl
                        shadow-sm hover:shadow-md transition-all
                    "
                            >
                                Get started
                            </Button>

                        </div>
                    </div>

                    {/* ================= SEE THE MAGIC SECTION ================= */}
                    {/*
        <div className="bg-gradient-to-br from-[#f1f6ff] via-[#f7f6ff] to-[#fdf3f8]
            py-10 md:py-16 px-4 md:px-6 flex-1 flex items-center">

            <div className="max-w-4xl mx-auto w-full">

                <h2
                    className="font-extrabold text-center mb-4
                    text-[clamp(1.6rem,4.5vw,2.2rem)]"
                >
                    One Donation.
                    <span className="text-[#1600ff]"> Every</span> Nonprofit
                    <span className="font-black"> YOU</span> Care About.
                </h2>

                <p className="text-muted-foreground text-center mb-8
                    text-[clamp(0.95rem,2vw,1.2rem)]">
                    Set your monthly amount. We split it automatically.
                </p>

                <Card className="max-w-[90%] md:max-w-[80%] lg:max-w-3xl mx-auto">
                    <CardContent className="p-4 md:p-8">

                        <div className="text-gray-500 mb-6 text-center">
                            You can give
                            <span className="text-[#1600ff] font-black text-3xl md:text-5xl">
                                ${donationAmount}
                            </span>
                            /month
                        </div>

                        <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={donationAmount}
                            onChange={(e) =>
                                setDonationAmount(
                                    Math.round(Number(e.target.value) / 5) * 5
                                )
                            }
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-6"
                        />

                        <div className="font-bold text-[#1600ff] text-center mb-6">
                            ${donationAmount * 12} /year of impact
                        </div>

                        <Button
                            onClick={() => navigate("/onboarding")}
                            className="w-full h-12 rounded-full font-bold text-lg bg-[#1600ff] text-white"
                        >
                            Start Supporting
                        </Button>

                    </CardContent>
                </Card>

            </div>
        </div>
        */}

                </div>
            </div>
            {/* Automatic Impact Section */}
            {/* <AutomaticImpact /> */}

            {/* Show What You Stand For Section */}
            {/* <ShowStandFor /> */}

            {/* Popular Collectives Section */}
            {/* <PopularCollectives /> */}

            {/* Learn & Get Inspired Section */}
            {/* <LearnAndGetInspired /> */}

            {/* Community Testimonials Section */}
            {/* <CommunityTestimonials /> */}

            {/* Start Making a Difference Section */}
            {/* <StartMakingDifference /> */}

            {/* Footer */}
            <Footer />

            {/* Fixed iOS App Banner */}
            {showAppBanner && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 z-40 shadow-lg block sm:hidden">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
                        <a
                            href="https://apps.apple.com/us/app/crwd-collective-giving/id6748994882"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 md:gap-4 flex-1 cursor-pointer"
                        >
                            {/* <NewLogo /> */}
                            <img src="/icons/FullLogo.png" width={75} height={75} />

                            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                <p className="text-xs xs:text-sm md:text-base font-bold text-gray-900">
                                    Get the full experience on iOS
                                </p>
                                <p className="text-xs xs:text-sm md:text-sm text-gray-500">
                                    Easily manage all of your giving
                                </p>
                            </div>
                        </a>
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
                        {/* <div className="px-4 sm:px-6 py-3 sm:py-4">
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
                        </div> */}
                    </div>
                </div>
            )}
        </div>
    )
}