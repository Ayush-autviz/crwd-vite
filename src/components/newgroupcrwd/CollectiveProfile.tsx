import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface CollectiveProfileProps {
  name: string;
  image?: string;
  founder?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    profile_picture?: string;
  };
  description?: string;
  isJoined?: boolean;
}

export default function CollectiveProfile({
  name,
  image,
  founder,
  description,
  isJoined = false,
}: CollectiveProfileProps) {
  const navigate = useNavigate();

  const founderName = founder
    ? `${founder.first_name || ''} ${founder.last_name || ''}`.trim() || founder.username
    : 'Unknown';

  const handleFounderClick = () => {
    if (founder?.id) {
      navigate(`/user-profile/${founder.id}`);
    }
  };
  

  return (
    <div className="px-4 py-6">
      <div className="flex items-start gap-4 mb-3">
        <Avatar className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex-shrink-0">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-gray-200 rounded-xl text-gray-600 font-bold text-3xl">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-[800] text-2xl md:text-3xl text-foreground">
              {name}
            </h2>
            {isJoined && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                Joined
              </span>
            )}
          </div>
        </div>
      </div>
      {founder && (
        <div className="flex items-center gap-2">
            <img src={founder?.profile_picture || image} alt={name} className="w-6 h-6 rounded-full" />
        <p className="text-muted-foreground text-sm md:text-base">
          Founded by{' '}
          <button
            onClick={handleFounderClick}
            className="text-[#1600ff] hover:underline font-medium"
          >
            {founderName}
          </button>
        </p>
        </div>
      )}
      {description && (
        <p className="text-foreground text-sm md:text-base leading-relaxed mt-5">
          {description}
        </p>
      )}
    </div>
  );
}

