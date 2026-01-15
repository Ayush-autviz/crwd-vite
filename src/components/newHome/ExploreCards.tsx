import { useNavigate } from 'react-router-dom';
import { Search, Star, Users } from 'lucide-react';

export default function ExploreCards() {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'explore',
      icon: Search,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      title: 'Explore by Category',
      subtitle: 'Browse nonprofits making a difference',
      onClick: () => navigate('/search'),
    },
    {
      id: 'favorites',
      icon: Star,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      title: 'Your Favorites',
      subtitle: 'View your saved causes and collectives',
      onClick: () => navigate('/saved'),
    },
    {
      id: 'browse',
      icon: Users,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      title: 'Browse CRWDs',
      subtitle: 'Discover communities you can join',
      onClick: () => navigate('/circles'),
    },
  ];

  return (
    <div className="w-full px-4 md:px-6 py-4 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <button
              key={card.id}
              onClick={card.onClick}
              className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center gap-3 md:gap-4 cursor-pointer"
            >
              <div className={`${card.bgColor} ${card.iconColor} p-3 md:p-4 rounded-full`}>
                <IconComponent className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm xs:text-base md:text-lg lg:text-lg text-foreground">{card.title}</h3>
                <p className="text-xs xs:text-sm md:text-base text-muted-foreground">{card.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

