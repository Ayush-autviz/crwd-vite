import React from "react";

interface Category {
  id: string;
  name: string;
}

const Categories = () => {
  const categories: Category[] = [
    { id: "1", name: "Animal Welfare" },
    { id: "2", name: "Environment" },
    { id: "3", name: "Food Insecurity" },
    { id: "4", name: "Education" },
    { id: "5", name: "Healthcare" },
    { id: "6", name: "Housing" },
    { id: "7", name: "Social Justice" },
  ];

  return (
    <div>
      <h2 className="text-base font-medium text-gray-800 mb-3">Categories</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm whitespace-nowrap cursor-pointer transition-colors"
          >
            {category.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
