import React from 'react';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const suggested = [
  {
    avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    name: 'Grocery Spot',
    members: 303,
    subtitle: 'Community lunches every Saturday',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    name: 'Food for Thought',
    members: 78,
    subtitle: 'Solving world hunger. One meal at a time.',
  },
];


const suggestedCauses = [
  {
    name: "The Red Cross",
    description: "An health organization that...",
    image: "/adidas.jpg",
  },
  {
    name: "St. Judes",
    description: "The leading children's hea...",
    image: "/benz.jpg",
  },
  // {
  //   name: "Women's Healthcare of At...",
  //   description: "We are Atlanta's #1 healthca...",
  //   image: "/mclaren.jpg",
  // },
];

const GroupCrwdSuggested: React.FC = () => (
  <div className="mt-4 px-4">
  <h2 className="text-lg font-semibold mb-4">Suggested CRWDS</h2>
  <div className="space-y-3">
    {suggestedCauses.map((cause, index) => (
      <Link to="/groupcrwd" key={index} className="block">
        <div
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-card"
        >
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 mr-2">
            <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0">
              {cause.image && (
                <img
                  src={cause.image}
                  alt={cause.name}
                  className="object-cover"
                />
              )}
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-medium text-sm truncate">
                {cause.name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {cause.description}
              </p>
            </div>
          </div>
          <Button className="bg-primary text-white text-xs h-8 px-4 md:px-6 flex-shrink-0 cursor-pointer">
            Visit
          </Button>
        </div>
      </Link>
    ))}
  </div>
  <div className="flex justify-end mt-4">
    <Link to="/search">
      <Button variant="link" className="text-primary flex items-center">
        Discover More <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </Link>
  </div>
</div>
);

export default GroupCrwdSuggested;