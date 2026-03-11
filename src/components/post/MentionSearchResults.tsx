import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface MentionSearchResultsProps {
    results: any[];
    onSelect: (user: any) => void;
    className?: string;
}

export function MentionSearchResults({ results, onSelect, className }: MentionSearchResultsProps) {
    if (!results || results.length === 0) return null;

    return (
        <div className={`absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mb-2 max-h-48 overflow-y-auto z-[60] ${className}`}>
            {results.map((user: any) => (
                <button
                    key={`${user.type}-${user.id}`}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none"
                    onClick={() => onSelect(user)}
                >
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={user.logo} />
                        <AvatarFallback
                            style={{ backgroundColor: user.color || '#3B82F6' }}
                            className="text-[10px] text-white"
                        >
                            {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-sm font-semibold truncate">{user.name}</span>
                        <div className="flex items-center gap-2">
                            {/* <span className="text-[10px] text-gray-400 capitalize">{user.type}</span> */}
                            {user.username && (
                                <span className="text-[10px] text-gray-400">@{user.username}</span>
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
