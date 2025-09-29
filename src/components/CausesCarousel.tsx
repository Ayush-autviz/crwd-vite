import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const data = [
  {
    image: "/grocery.jpg",
    heading: "Choose Causes You Care About",
    subHeading: "Add nonprofits you love in seconds.",
  },
  {
    image: "/grocery.jpg",
    heading: "One Donation. Split Automatically.",
    subHeading: "Set your gift once, and we'll divide it across your causes.",
  },
  {
    image: "/grocery.jpg",
    heading: "Join or Start a Collective",
    subHeading: "Give together with friends, coworkers or your community.",
  },
];

export default function CausesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality - only on mobile
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
    <>
      {/* Mobile Carousel View */}
      <div className="md:hidden">
        <div className="relative overflow-hidden">
          <div className="relative h-32">
            {data.map((item, index) => (
              <div
                key={index}
                className={`absolute inset-0 p-5 rounded-2xl shadow-lg border border-gray-200 transition-all duration-500 ease-in-out ${
                  index === currentIndex
                    ? "opacity-100 translate-x-0"
                    : index < currentIndex
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                }
                ${
                  index === 0
                    ? "bg-indigo-800"
                    : index === 1
                    ? "bg-lime-700"
                    : "bg-red-600"
                }
                `}
              >
                <div className="flex items-center justify-between h-full gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-center text-white text-2xl font-bold mb-2 leading-tight">
                      {item.heading}
                    </h3>
                    <p className="text-md text-white font-medium text-center leading-relaxed">
                      {item.subHeading}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots - Mobile Only */}
        <div className="flex justify-end items-center gap-2 mt-6 mr-6">
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

      {/* Desktop Grid View */}
      <div className="hidden md:flex md:gap-4 md:overflow-x-auto scrollbar-none md:pb-4">
        {data.map((item, index) => (
          <div
            key={index}
            className={`py-3 px-4 rounded-2xl shadow-lg border border-gray-200 flex-shrink-0 w-80 ${
              index === 0
                ? "bg-indigo-800"
                : index === 1
                ? "bg-lime-700"
                : "bg-red-600"
            }`}
          >
            <div className="text-center">
              <h3 className="text-white text-xl font-bold mb-3 leading-tight">
                {item.heading}
              </h3>
              <p className="text-white text-sm  leading-relaxed">
                {item.subHeading}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
