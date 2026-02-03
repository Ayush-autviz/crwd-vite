import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { categories } from '@/constants/categories';

interface CauseDetailsProps {
  causeData: any;
}

export default function CauseDetails({ causeData }: CauseDetailsProps) {
  // Get all matching categories from the category string (e.g., "MP" -> "M", "P")
  const displayedCategories = categories.filter(
    (cat) => cat.id && typeof causeData?.category === 'string' && causeData.category.includes(cat.id)
  );
  const mainCategory = displayedCategories[0];

  // Get related categories - show related categories based on the first category
  const getRelatedCategories = () => {
    if (!mainCategory) return [];

    // Map of category IDs to related category IDs
    const relatedMap: Record<string, string[]> = {
      'G': ['E', 'F', 'H', 'U'], // Wellness -> Health, Mental, Research, Science
      'E': ['G', 'F', 'H', 'U'], // Health -> Wellness, Mental, Research, Science
      'F': ['E', 'G', 'H'], // Mental -> Health, Wellness, Research
      'H': ['E', 'F', 'U', 'G'], // Research -> Health, Mental, Science, Wellness
      'U': ['H', 'E', 'G'], // Science -> Research, Health, Wellness
    };

    const relatedIds = relatedMap[mainCategory.id] || [];
    return relatedIds
      .map(id => categories.find(cat => cat.id === id))
      .filter(Boolean) as typeof categories;
  };

  const relatedCategories = getRelatedCategories();

  return (
    <div className="mx-3 md:mx-4 mb-4 md:mb-6 bg-gray-50 rounded-xl p-3 md:p-4">
      {/* Address */}
      {causeData?.street && (
        <div className="flex items-start gap-1.5 md:gap-2 mb-3 md:mb-4">
          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs xs:text-sm md:text-base font-bold text-gray-900 mb-0.5 md:mb-1">ADDRESS</h3>
            <div className="text-xs xs:text-sm md:text-base text-gray-700 uppercase">
              {causeData.street}
              {causeData.city && `, ${causeData.city}`}
              {causeData.state && `, ${causeData.state}`}
            </div>
          </div>
        </div>
      )}

      {/* Related Causes */}
      {/* {relatedCategories.length > 0 && (
        <div className="mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-1.5 md:mb-2">RELATED CAUSES</h3>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {relatedCategories.map((cat) => (
              <span
                key={cat.id}
                className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium text-white"
                style={{ backgroundColor: cat.text }}
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      )} */}

      {/* Main Focus */}
      {displayedCategories.length > 0 && (
        <div className="mb-3 md:mb-4">
          <h3 className="text-xs xs:text-sm md:text-base font-bold text-gray-900 mb-0.5 md:mb-1">MAIN FOCUS</h3>
          <div className="flex flex-wrap gap-x-1.5">
            {displayedCategories.map((cat, index) => (
              <span key={cat.id}>
                <Link to={`/search-results?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}&q=${encodeURIComponent(cat.name)}`}
                  className="text-xs xs:text-sm md:text-base font-medium hover:underline"
                  style={{ color: '#1600ff' }}>
                  {cat.name}
                </Link>
                {index < displayedCategories.length - 1 && <span className="text-xs xs:text-sm md:text-base text-gray-500">,</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tax ID */}
      {causeData?.tax_id_number && (
        <div>
          <h3 className="text-xs xs:text-sm md:text-base font-bold text-gray-900 mb-0.5 md:mb-1">TAX ID</h3>
          <span className="text-xs xs:text-sm md:text-base text-gray-700">{causeData.tax_id_number}</span>
        </div>
      )}
    </div>
  );
}

