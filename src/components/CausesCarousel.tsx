import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const data = [
  {
    image: "/grocery.jpg",
    heading: "Pick your Causes",
    subHeading: "Search or explore non-profits by category or local CRWDS.",
  },
  {
    image: "/grocery.jpg",
    heading: "Set One Donation",
    subHeading: "Decide your amount once - it splits across your chosen causes.",
  },
  {
    image: "/grocery.jpg",
    heading: "Give Together",
    subHeading: "Join CRWDs to give alongside others and see your shared impact.",
  },
];

export default function CausesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5 md:p-6 rounded-2xl shadow-lg border border-primary/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
      {/* <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12"></div> */}

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background border border-border shadow-md"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background border border-border shadow-md"
        >
          <ChevronRight className="h-4 w-4" />
        </Button> */}

        {/* Carousel Content */}
        <div className="relative h-32 md:h-36">
          {data.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                index === currentIndex
                  ? "opacity-100 translate-x-0"
                  : index < currentIndex
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between h-full gap-4 md:gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.heading}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl shadow-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-primary text-lg md:text-xl lg:text-2xl font-extrabold text-foreground mb-2 leading-tight">
                    {item.heading}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {item.subHeading}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {data.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-primary/30 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
