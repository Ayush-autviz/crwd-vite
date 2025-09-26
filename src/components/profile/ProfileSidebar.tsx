import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Star, Award, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Link } from "react-router-dom";

const suggestedFriends = [
  {
    name: "Ava Smith",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Liam Brown",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Olivia Lee",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

const ProfileSidebar: React.FC<{ extraInfo?: boolean }> = ({
  extraInfo = true,
}) => (
  <aside className="space-y-6 w-full">
    {/* Achievements */}
    {extraInfo && (
      <>
        {/* <Card>
      <CardContent className="">
        <h2 className="text-xl font-bold mb-4">Achievements</h2>
        <ul className="space-y-3">
          {achievements.map((ach, idx) => (
            <li key={idx} className="flex items-center gap-3 py-1">
              <div className="flex-shrink-0 bg-muted/50 w-8 h-8 rounded-full flex items-center justify-center">
                {ach.icon}
              </div>
              <span className="text-sm font-medium">{ach.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card> */}

        {/* Suggested Friends */}
        <Card>
          <CardContent className="">
            <h2 className="text-xl font-bold mb-4">Suggested Friends</h2>
            <div className="space-y-4">
              {suggestedFriends.map((friend, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{friend.name}</span>
                  </div>
                  <Button size="sm">Follow</Button>
                </div>
              ))}
            </div>
            <Link to="/search">
              <Button
                variant="link"
                className="text-primary p-0 -ml-2 h-auto mt-2 flex items-center"
              >
                See all <ChevronRight className="h-4 w-4 " />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </>
    )}

    {/* Trending Causes */}
    {/* <Card>
      <CardContent className="">
        <h2 className="text-xl font-bold mb-4">Trending Causes</h2>
        <div className="flex flex-wrap gap-2">
          {trendingCauses.map((cause, idx) => (
            <Link to="/search">
            <Badge
              key={idx}
              variant="secondary"
              className="bg-muted/50 hover:bg-muted text-foreground rounded-md px-3 py-1 whitespace-nowrap"
            >
              {cause}
            </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card> */}
  </aside>
);

export default ProfileSidebar;
