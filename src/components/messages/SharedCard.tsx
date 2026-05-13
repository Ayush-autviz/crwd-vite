import { ChatMessage } from "./types";
import { Heart, MessageCircle } from "lucide-react";
import { cn, encodePostId } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SharedCardProps {
  cardData: NonNullable<ChatMessage["cardData"]>;
  isMe?: boolean;
}

export function SharedCard({ cardData, isMe }: SharedCardProps) {
  const navigate = useNavigate();

  const handleNavigation = () => {
    const identifier = cardData.sortName || cardData.id;
    if (cardData.type === "cause" || cardData.type === "nonprofit") {
      navigate(`/c/${identifier}`);
    } else if (cardData.type === "collective") {
      navigate(`/g/${identifier}`);
    } else if (cardData.type === "fundraiser") {
      navigate(`/fundraiser/${encodePostId(cardData.id)}`);
    } else if (cardData.type === "post") {
      navigate(`/post/${encodePostId(cardData.id)}`);
    } else if (cardData.type === "profile") {
      navigate(`/u/${cardData.username || identifier}`);
    }
  };

  if (cardData.type === "cause" || cardData.type === "nonprofit" || cardData.type === "collective" || cardData.type === "profile" || cardData.type === "fundraiser") {
    return (
      <div
        onClick={handleNavigation}
        className={cn(
          "rounded-2xl p-1.5 shadow-sm min-w-xs max-w-sm w-fit cursor-pointer hover:opacity-95 transition-opacity",
          isMe ? "bg-[#2222EE] text-white" : "bg-gray-100 text-gray-900"
        )}
      >
        <div className={cn(
          "rounded-xl p-3 flex items-center gap-3",
          isMe ? "bg-white/10" : "bg-gray-200/60"
        )}>
          {cardData.image ? (
            <img
              src={cardData.image}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0 bg-white"
              alt={cardData.title}
            />
          ) : (
            <div
              className={cn(
                "w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold text-white",
                !cardData.color && (isMe ? "bg-white/20" : "bg-gray-400")
              )}
              style={cardData.color ? { backgroundColor: cardData.color } : undefined}
            >
              {cardData.title?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="flex flex-col min-w-0 pr-2">
            <span className={cn(
              "font-bold text-[15px] leading-tight truncate",
              isMe ? "text-white" : "text-gray-900"
            )}>
              {cardData.title}
            </span>
            {cardData.description && (
              <span className={cn(
                "text-[13px] leading-snug truncate mt-0.5",
                isMe ? "text-white/80" : "text-gray-500"
              )}>
                {cardData.description}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleNavigation}
      className={cn(
        "rounded-2xl p-1.5 shadow-md min-w-xs max-w-md w-fit cursor-pointer hover:opacity-95 transition-opacity",
        isMe ? "bg-[#2222EE]" : "bg-gray-100"
      )}
    >
      <div className={cn(
        "rounded-xl p-4 space-y-3",
        isMe ? "bg-white/10" : "bg-gray-200/60"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2">
          {cardData.avatar ? (
            <img
              src={cardData.avatar}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              alt={cardData.title}
            />
          ) : (
            <span className={cn(
              "p-1 rounded-full text-sm flex-shrink-0 flex items-center justify-center",
              isMe ? "bg-white/20" : "bg-gray-300"
            )}>
              {cardData.icon}
            </span>
          )}
          <span className={cn(
            "font-bold text-sm leading-tight truncate",
            isMe ? "text-white" : "text-gray-900"
          )}>
            {cardData.title}
          </span>
        </div>

        {/* Description */}
        {cardData.description && (
          <p className={cn(
            "text-sm leading-relaxed font-medium line-clamp-3",
            isMe ? "text-white/90" : "text-gray-600"
          )}>
            {cardData.description}
          </p>
        )}

        {/* Cover Image */}
        {cardData.image && (
          <div className="w-full overflow-hidden rounded-lg">
            <img
              src={cardData.image}
              className="w-full h-36 object-cover"
              alt="Shared preview"
            />
          </div>
        )}

        {/* Interaction metrics row */}
        {cardData.type === "post" && (
          <div className={cn(
            "flex items-center gap-3 pt-1",
            isMe ? "text-white/90" : "text-gray-600"
          )}>
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{cardData.likesCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{cardData.commentsCount || 0}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
