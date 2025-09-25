const HomeBanner = () => {
  const cards = [
    {
      id: 1,
      image: "/adidas.jpg", // Using existing image from public folder
      tag: "Impact Story",
      tagColor: "bg-orange-600",
      title: "How a Local Charity Made a Difference",
      description:
        "Read about one organization's journey to support its community",
    },
    {
      id: 2,
      image: "/grocery.jpg", // Using existing image from public folder
      tag: "Giving Tips",
      tagColor: "bg-green-700",
      title: "The Benefits of Monthly Giving",
      description: "How recurring donations can help maximize your impact",
    },
    {
      id: 3,
      image: "/post.jpg", // Using existing image from public folder
      tag: "CRWD News",
      tagColor: "bg-purple-700",
      title: "5 Inspiring Volunteer Initiative",
      description:
        "Get inspired by remarkable volunteer programs and their stories",
    },
  ];

  return (
    <div className="py-4">
      <div className="max-w-7xl flex justify-center">
        <div className="flex gap-6 overflow-x-auto scrollbar-none pb-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex-shrink-0 w-60 "
            >
              {/* Image Section */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content Section */}
              <div className="p-3">
                {/* Tag */}
                <div
                  className={`inline-block px-3 py-1 rounded-md text-white text-sm font-medium mb-3 ${card.tagColor}`}
                >
                  {card.tag}
                </div>

                {/* Title */}
                <h3 className="text-md font-bold text-gray-900 mb-1 leading-tight">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-xs leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
