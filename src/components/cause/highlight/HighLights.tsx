import React from 'react';
import { Link } from 'react-router-dom';

interface Highlight {
  avatar: string;
  name: string;
  founder: string;
  founderAvatar: string;
  bio: string;
}

const highlights: Highlight[] = [
    {
        avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
        name: "Chad's CRWD",
        founder: 'chad',
        founderAvatar: 'https://randomuser.me/api/portraits/men/33.jpg',
        bio: "This is a CRWD bio that provides a preview of the group's mission and goals. The elements are clickable.",
    },
    {
        avatar: 'https://randomuser.me/api/portraits/women/46.jpg',
        name: 'Better Together',
        founder: 'carebear',
        founderAvatar: 'https://randomuser.me/api/portraits/women/46.jpg',
        bio: "Community outreach is my love language. This is the CRWD bio. We'd love to have you",
    },
    {
        avatar: 'https://randomuser.me/api/portraits/men/34.jpg',
        name: "Chad's CRWD",
        founder: 'chad',
        founderAvatar: 'https://randomuser.me/api/portraits/men/33.jpg',
        bio: "This is a CRWD bio that provides a preview of the group's mission and goals. The elements are clickable.",
    },
    {
        avatar: 'https://randomuser.me/api/portraits/women/47.jpg',
        name: 'Better Together',
        founder: 'carebear',
        founderAvatar: 'https://randomuser.me/api/portraits/women/46.jpg',
        bio: "Community outreach is my love language. This is the CRWD bio. We'd love to have you",
    },
];

// Group highlights into pairs
const highlightPairs = [] as Highlight[][];
for (let i = 0; i < highlights.length; i += 2) {
  highlightPairs.push(highlights.slice(i, i + 2));
}

const HighLights: React.FC = () => (
  <div className="px-4 pt-2 pb-2">
    <div className="font-semibold text-sm text-gray-900 mb-3">
      Community Highlights <span className="font-normal text-gray-500">• In 6 CRWDS</span>
    </div>
    <div className="overflow-x-auto scrollbar-hide -mx-1">
      <div className="flex flex-row gap-x-4 px-1 pb-2">
        {highlightPairs.map((pair, i) => (
          <div key={i} className="flex flex-col gap-y-4 w-[80vw] max-w-xs min-w-sm">
            {pair.map((h, j) => (
              <Link
                to={`/feed-hungry`}
                key={j}
                className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex gap-3">
                  <img src={h.avatar} alt={h.name} className="w-11 h-11 rounded-lg object-cover" />
                  <div className="flex flex-col ">
                    <span className="font-semibold text-base text-gray-900">{h.name}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      Founded by <img src={h.founderAvatar} alt={h.founder} className="w-4 h-4 rounded-full inline-block mx-1" />
                      <span className="font-semibold text-gray-700">@{h.founder}</span>
                    </span>
                  </div>
                </div>
                <div className="text-lg text-gray-700 line-clamp-2 mt-2">{h.bio}</div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
    <div className="flex justify-end mt-3">
      <Link to="/create-crwd">
        <div className="text-blue-600 text-sm font-medium hover:text-blue-800 cursor-pointer">Create a CRWD</div>
      </Link>
    </div>
  </div>
);

export default HighLights;
