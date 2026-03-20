import React from 'react';

export const HelloGreetingSkeleton: React.FC = () => (
    <div className="w-full max-w-md mx-auto mb-2 opacity-60">
        <div className="h-6 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
    </div>
);

export const DonationBoxSkeleton: React.FC = () => (
    <div className="w-full max-w-md mx-auto mt-2 md:mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-6 shadow-sm animate-pulse">
            <div className="flex items-center gap-2.5 md:gap-4">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
            <div className="mt-3 md:mt-6 space-y-1.5">
                <div className="h-2.5 bg-gray-200 rounded"></div>
                <div className="h-2.5 bg-gray-200 rounded w-5/6"></div>
            </div>
        </div>
    </div>
);

export const CollectiveCarouselSkeleton: React.FC = () => (
    <div className="w-full mt-2 md:mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-6 shadow-none animate-pulse">
            <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-24 md:h-40 bg-gray-200 rounded-lg"></div>
                <div className="flex gap-2 justify-center">
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    </div>
);

export const CommunityUpdatesSkeleton: React.FC = () => (
    <div className="w-full my-4 mb-6 md:my-8 md:mb-10 px-4 md:px-0">
        <div className="mb-3 md:mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="space-y-4">
            {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 animate-pulse">
                    <div className="flex items-start gap-2 md:gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-100 rounded w-full"></div>
                            <div className="h-3 bg-gray-100 rounded w-full"></div>
                            <div className="h-48 bg-gray-50 rounded-lg w-full mt-2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const FeaturedNonprofitsSkeleton: React.FC = () => (
    <div className="py-4 md:py-6 px-4 md:px-0">
        <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-8 bg-gray-100 rounded-full w-20 animate-pulse"></div>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white min-w-[240px] md:min-w-[280px] animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const SuggestedCollectivesSkeleton: React.FC = () => (
    <div className="py-4 md:py-6 px-4 md:px-0">
        <div className="mb-4 md:mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50 min-w-[240px] md:min-w-[280px] animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                </div>
            ))}
        </div>
    </div>
);

const HomeSkeleton: React.FC = () => {
    return (
        <div className="w-full bg-white min-h-screen">
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-4 md:px-6 py-2 md:py-6">
                <HelloGreetingSkeleton />
                <DonationBoxSkeleton />
                <CollectiveCarouselSkeleton />
            </div>

            <div className="w-full max-w-7xl mx-auto md:px-6">
                <CommunityUpdatesSkeleton />
                <FeaturedNonprofitsSkeleton />
                <SuggestedCollectivesSkeleton />
            </div>
        </div>
    );
};

export default HomeSkeleton;
