import { Eye, Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Cause {
  id: number;
  name: string;
  image?: string;
  mission?: string;
  sort_name: string;
}

interface PreviouslySupportedItem {
  id: number;
  removed_at: string;
  cause: Cause;
}

interface PreviouslySupportedCausesProps {
  causes: PreviouslySupportedItem[];
  onAdd: (causeId: number) => void;
}

const avatarColors = [
  '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
  '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (name: string) => {
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const PreviouslySupportedCauses = ({ causes, onAdd }: PreviouslySupportedCausesProps) => {
  const navigate = useNavigate();

  if (!causes || causes.length === 0) return null;

  return (
    <div className="mt-6 md:mt-8 mb-4 md:mb-6">
      <div className="mb-3 md:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Previously Supported</h2>
        <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">Causes you supported in the past</p>
      </div>

      <div className="space-y-2.5 md:space-y-3">
        {causes.map((item) => {
          const { cause } = item;
          const avatarBgColor = getConsistentColor(cause.id, avatarColors);
          const initials = getInitials(cause.name || 'N');

          return (
            <div
              key={item.id}
              onClick={() => navigate(`/c/${cause.sort_name}`)}
              className="flex items-center p-3 md:p-4 bg-white border border-gray-200 rounded-lg md:rounded-2xl shadow-sm hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex-shrink-0 border border-gray-200 mr-3 md:mr-4">
                <AvatarImage src={cause.image} alt={cause.name} />
                <AvatarFallback
                  style={{ backgroundColor: `${avatarBgColor}20`, color: avatarBgColor }}
                  className="font-bold rounded-lg md:rounded-xl text-base md:text-lg"
                >
                  {initials[0]}
                </AvatarFallback>
              </Avatar>

              {/* Cause Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-gray-900 mb-0.5 md:mb-1 truncate">
                  {cause.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 truncate">
                  {cause.mission || "Providing support where it's needed most"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4">
                {/* <button
                  onClick={() => navigate(`/c/${cause.sort_name}`)}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-blue-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  aria-label="View cause"
                >
                  <Eye className="w-4 h-4 md:w-5 md:h-5" />
                </button> */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAdd(cause.id)
                  }}
                  className="bg-pink-100 hover:bg-pink-200 p-2 cursor-pointer text-pink-600 font-bold rounded-full  text-xs md:text-sm"
                >
                  <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 " strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
