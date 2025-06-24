import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  User,
} from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";

interface PostProps {
  username?: string;
  timeAgo?: string;
  organization?: string;
  organizationUrl?: string;
  content?: string;
  imageUrl?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  avatarUrl?: string;
}

export default function Post({
  username = "mynameismya",
  timeAgo = "17h",
  organization = "feedthehungry",
  organizationUrl = "/profile",
  content = "The quick, brown fox jumps over a lazy dog. DJs flock by animal welfare quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex!",
  imageUrl,
  likes = 258,
  comments = 15,
  shares = 3,
  avatarUrl = "/placeholder.svg?height=48&width=48"
}: PostProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={username} />
            ) : (
              <User className="h-6 w-6" />
            )}
            <AvatarFallback>{username.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{username}</span>
                <span className="text-xs text-muted-foreground ml-2">• {timeAgo}</span>
              </div>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </div>
            <a href={organizationUrl} className="text-xs text-primary hover:underline">{organization}</a>

            <div className="text-sm mt-2 mb-3 whitespace-pre-line leading-snug">
              {content}
            </div>

            {imageUrl && (
              <div className="w-full h-48 rounded-lg overflow-hidden mb-3">
                <img src={imageUrl} alt="Post" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-4 text-muted-foreground mt-2">
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-xs">{likes}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">{comments}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="text-xs">{shares}</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
