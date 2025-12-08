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
    <div className="px-4 md:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <button
              key={card.id}
              onClick={card.onClick}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center gap-4 cursor-pointer"
            >
              <div className={`${card.bgColor} ${card.iconColor} p-4 rounded-full`}>
                <IconComponent className="w-8 h-8" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base md:text-lg text-foreground">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

