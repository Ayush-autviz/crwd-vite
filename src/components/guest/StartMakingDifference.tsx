import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function StartMakingDifference() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#a955f7] py-12 md:py-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h2 className="font-[800] text-white mb-4 md:mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
          Start Making a Difference
        </h2>

        {/* Subtitle */}
        <p className="text-white mb-6 md:mb-8 text-lg md:text-xl max-w-2xl mx-auto">
          The simplest way to support every cause you care about.
        </p>

        {/* Call-to-Action Button */}
        {/* <Button
          onClick={() => navigate("/onboarding")} */}
          <a href="/onboarding"
          className="bg-[#aeff30] hover:bg-[#93c902] text-black font-[700] px-8 md:px-10 py-6 md:py-7 rounded-full text-base md:text-lg shadow-lg"
        >
          Get Started for Free
        </a>
        {/* </Button> */}
      </div>
    </div>
  );
}

