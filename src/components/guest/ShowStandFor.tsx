import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ShowStandFor() {
    return (
        <div className="bg-background py-12 md:py-24 px-4 md:px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                {/* Left Side - Image Placeholder (hidden on small screens, visible on md+) */}
                <div className="hidden md:flex w-full justify-center md:justify-end">
                    {/* Using a placeholder visual that mimics a profile card */}
                    {/* <div className="relative w-full max-w-md aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col items-center justify-center p-6">
                        <div className="w-20 h-20 rounded-full bg-blue-100 mb-4 flex items-center justify-center text-2xl font-bold text-[#1600ff]">
                            AC
                        </div>
                        <div className="h-4 w-32 bg-gray-200 rounded-full mb-2"></div>
                        <div className="h-3 w-48 bg-gray-100 rounded-full mb-6"></div>

                        <div className="w-full grid grid-cols-3 gap-2">
                            <div className="aspect-square rounded-lg bg-orange-100"></div>
                            <div className="aspect-square rounded-lg bg-green-100"></div>
                            <div className="aspect-square rounded-lg bg-purple-100"></div>
                        </div>

                        <div className="absolute top-0 left-0 w-full h-full bg-white/10"></div>
                    </div> */}
                    <img src="/learn/stand.jpeg" alt="Show Stand For" className="w-full h-80 object-contain" />
                </div>

                {/* Right Side - Content */}
                <div className="text-center md:text-left flex flex-col items-center md:items-start">
                    {/* Image for small screens (shown above button, hidden on md+) */}
                    

                    <h2 className="font-[800] text-foreground mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl leading-tight">
                        Show What You Stand For
                    </h2>
                    <p className="text-muted-foreground text-base md:text-lg mb-6 md:mb-8 max-w-md">
                        Get a public profile showing what you support. Inspire others and connect with your community.
                    </p>

                    <div className="md:hidden w-full mb-6 flex justify-center">
                        <img src="/learn/stand.jpeg" alt="Show Stand For" className="w-full h-80 object-contain" />
                    </div>

                    <Button className="bg-[#1600ff] hover:bg-[#1100cc] text-white rounded-full px-8 py-1.5 sm:py-3 text-base md:text-lg font-bold h-auto">
                        See How It Works
                    </Button>

                </div>
            </div>
        </div>
    );
}
