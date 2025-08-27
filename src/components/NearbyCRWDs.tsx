import React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { Link } from "react-router-dom";

interface NearbyCRWD {
  id: string;
  name: string;
  description: string;
  image: string;
}

const NearbyCRWDs = () => {
  const nearbyCRWDs: NearbyCRWD[] = [
    {
      id: "1",
      name: "The Red Cross",
      description: "An health organization that...",
      image: "/view.png",
    },
    {
      id: "2",
      name: "St. Judes",
      description: "The leading children's hos...",
      image: "/view.png",
    },
    {
      id: "3",
      name: "Women's Healthcare of Atlanta",
      description: "We are Atlanta's #1 healthc...",
      image: "/view.png",
    },
  ];

  return (
    <div className="bg-card p-4 md:p-5 rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Local Causes and CRWDs</h2>
      <div className="space-y-3">
        {nearbyCRWDs.map((crwd) => (
          <Link to="/cause" key={crwd.id} className="block">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-card border shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 mr-2">
                <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0">
                  {crwd.image && (
                    <img
                      src={crwd.image}
                      alt={crwd.name}
                      className="object-cover"
                    />
                  )}
                </Avatar>
                <div className="min-w-0">
                  <h3 className="font-medium text-sm truncate">{crwd.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {crwd.description}
                  </p>
                </div>
              </div>
              <Button className=" text-white text-xs h-8 px-4 md:px-6 flex-shrink-0 cursor-pointer">
                Visit
              </Button>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Link to="/search">
          <Button
            variant="link"
            className="text-primary flex items-center p-0 h-auto"
          >
            Discover More <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NearbyCRWDs;
