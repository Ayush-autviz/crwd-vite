import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateCollectiveCard() {
  const navigate = useNavigate();

  return (
    <div className="w-full py-2 md:max-w-2xl md:mx-auto">
      <Card
        onClick={() => navigate('/create-crwd')}
        className="cursor-pointer py-0 hover:shadow-md transition-shadow border border-gray-200 bg-white"
      >
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col items-start gap-2.5 md:flex-row md:items-start md:gap-4">
            {/* Green Icon */}
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#aeff30] flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4 md:w-6 md:h-6 text-black" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0 text-left w-full md:w-auto">
              <h3 className="font-bold text-sm xs:text-base md:text-lg text-foreground">
                Start Your Own Collective
              </h3>
              <p className="text-xs xs:text-sm md:text-base text-gray-600 mb-1.5 md:mb-2 mt-0.5 md:mt-1">
                Bring people together around causes you care about.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/create-crwd');
                }}
                className="text-foreground font-semibold text-sm xs:text-base md:text-lg hover:underline flex items-center gap-1 self-start"
              >
                Create collective
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

