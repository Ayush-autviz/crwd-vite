import { Badge } from '@/components/ui/badge';

export interface Category {
    id: number | string;
    name: string;
    text_color?: string;
    text?: string;
    background_color?: string;
    background?: string; // For backward compatibility with existing code
}

interface CategoryBadgesProps {
    categories: Category[];
    onCategoryClick?: (category: Category) => void;
    className?: string;
}

const CategoryBadges = ({ categories, onCategoryClick, className = "" }: CategoryBadgesProps) => {
    if (!categories || categories.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {categories.map((cat) => (
                <Badge
                    key={cat.id}
                    variant="secondary"
                    onClick={() => onCategoryClick?.(cat)}
                    className={`rounded-full px-2.5 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-opacity`}
                    style={{
                        backgroundColor: cat.background_color || cat.background,
                        color: cat.text_color || cat.text || '#FFFFFF',
                    }}
                >
                    {cat.name}
                </Badge>
            ))}
        </div>
    );
};

export default CategoryBadges;
