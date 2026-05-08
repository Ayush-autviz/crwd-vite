import { ChatMessage } from "./types";

interface SharedCardProps {
  cardData: NonNullable<ChatMessage["cardData"]>;
}

export function SharedCard({ cardData }: SharedCardProps) {
  return (
    <div className="bg-[#2222EE] rounded-2xl overflow-hidden p-1 shadow-md w-full max-w-sm">
      <div className="bg-[#2222EE] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="bg-white/20 p-1.5 rounded-full text-base">{cardData.icon}</span>
          <span className="text-white font-semibold text-base tracking-tight">{cardData.title}</span>
        </div>
        <p className="text-white/90 text-sm leading-relaxed font-medium">
          {cardData.description}
        </p>
      </div>
      <div className="px-1.5 pb-1.5 relative group">
        <img
          src={cardData.image}
          className="w-full h-48 object-cover rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
          alt="card"
        />
        <div className="absolute bottom-5 left-6 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span className="text-xs font-medium">❤️ 42</span>
          </div>
          <div className="flex items-center gap-1.5 text-white bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span className="text-xs font-medium">💬 8</span>
          </div>
        </div>
      </div>
    </div>
  );
}
