import React, { useState, useEffect } from "react";
import { CheckCircle, Heart, ShieldCheck } from "lucide-react";
import ClaimCauseDialog from "./ClaimCauseDialog";
import { Link } from "react-router-dom";
import { SharePost } from "../ui/SharePost";
import { Badge } from "../ui/badge";
import { Toast } from "../ui/toast";
import { categories } from "@/constants/categories";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { favoriteCause, unfavoriteCause } from "@/services/api/social";

interface CauseProfileCardProps {
  onLearnMoreClick?: () => void;
  causeData?: any;
}

const CauseProfileCard: React.FC<CauseProfileCardProps> = ({
  onLearnMoreClick,
  causeData,
}) => {
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isFavorited, setIsFavorited] = useState(causeData?.is_favorite || false);
  const causeId = causeData?.id;

  // Debug logging
  console.log('causeData:', causeData);
  console.log('is_favorite from API:', causeData?.is_favorite);
  console.log('isFavorited state:', isFavorited);

  // Favorite cause mutation
  const favoriteMutation = useMutation({
    mutationFn: favoriteCause,
    onSuccess: () => {
      setIsFavorited(true);
      setToastMessage("Added to favorites");
      setShowToast(true);
      // Invalidate favorite causes query to refresh the saved page
      queryClient.invalidateQueries({ queryKey: ['favoriteCauses'] });
    },
    onError: (error) => {
      console.error('Error favoriting cause:', error);
      setToastMessage("Failed to add to favorites");
      setShowToast(true);
    },
  });

  // Unfavorite cause mutation
  const unfavoriteMutation = useMutation({
    mutationFn: unfavoriteCause,
    onSuccess: () => {
      setIsFavorited(false);
      setToastMessage("Removed from favorites");
      setShowToast(true);
      // Invalidate favorite causes query to refresh the saved page
      queryClient.invalidateQueries({ queryKey: ['favoriteCauses'] });
    },
    onError: (error) => {
      console.error('Error unfavoriting cause:', error);
      setToastMessage("Failed to remove from favorites");
      setShowToast(true);
    },
  });

  const handleFavoriteClick = () => {
    if (isFavorited) {
      unfavoriteMutation.mutate(causeId);
    } else {
      favoriteMutation.mutate(causeId);
    }
  };

  // Update favorite state when causeData changes
  useEffect(() => {
    setIsFavorited(causeData?.is_favorite || false);
  }, [causeData?.is_favorite]);

  // const categories = [
  //   {
  //     name: "Animals",
  //     text: "#E36414", // Orange-Red
  //     background: "#FFE1CC", // Soft warm orange tint
  //   },
  //   {
  //     name: "Environment",
  //     text: "#6A994E", // Olive Green
  //     background: "#DFF0D6", // Fresh leafy green tint
  //   },
  //   {
  //     name: "Food",
  //     text: "#FF9F1C", // Carrot Orange
  //     background: "#FFE6CC", // Gentle light orange tint
  //   },
  // ];

  const category = categories.find((category) => category.id === causeData?.category);

  return (
    <div className="bg-white px-3 py-4 mx-3 mb-2 flex flex-col space-y-4">
      {/* CRWD Verified and Follow */}
      {/* <div className="flex items-center gap-2 sticky top-0 bg-white">
        <div className="text-lg font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
          Nonprofit
        </div>
        <div className="flex-grow" />
        <Button variant="outline" onClick={() => setShowShareModal(true)}>
          <Share2 size={20} />
        </Button>

        <Link to="/donation">
          <Button>Donate</Button>
        </Link>
      </div> */}
      {/* Profile */}
      <div className="flex items-center gap-4">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Helping Humanity"
          className="w-14 h-14 rounded-lg object-cover"
        />
        <div className="flex flex-col ">
          <span className="font-semibold text-base text-gray-900">
            {causeData?.name}
          </span>
          <span className="text-xs text-gray-500">
            in {causeData?.collective_count} CRWDS · 162 donations
          </span>
        </div>
        {/* <Button variant="outline"> */}
        {/* <Heart className="w-4 h-4 fill-red-500" /> */}
        {/* <button className="border-1 border-gray-500 rounded-md h-9 px-3 py-2"> */}
        <div className="flex items-center gap-2">
          <Heart
            className={`
                w-6 h-6
                ${isFavorited
                ? "stroke-red-500 fill-red-500"
                : "stroke-gray-500 fill-transparent"
              }
                hover:stroke-red-500 hover:fill-red-500
                cursor-pointer transition-colors duration-200
                ${(favoriteMutation.isPending || unfavoriteMutation.isPending) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            onClick={handleFavoriteClick}
          />
          {/* {(favoriteMutation.isPending || unfavoriteMutation.isPending) && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          )} */}
        </div>
        {/* </button> */}
        {/* </Button> */}
      </div>
      {/* Bio */}
      <div className="text-lg text-gray-700">
      {causeData?.mission}
        <div className="mt-2">
          <button
            onClick={onLearnMoreClick}
            className="text-blue-600 font-medium cursor-pointer flex items-center gap-1 hover:text-blue-800"
          >
            Learn More
          </button>
        </div>
      </div>
      {/* Tags */}
      {/* <ProfileInterests
        interests={["Animal Welfare", "Environment", "Food Insecurity"]}
        className="px-0 border-none"
      /> */}

      {/* Categories Section */}

      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-2 min-w-max">
          {/* {categories.map((category) => (
            <Link to={`/interests`} key={category.name}> */}
              <Badge
                variant="secondary"
                className="bg-muted/50 hover:bg-muted text-foreground rounded-md px-4 py-2 whitespace-nowrap"
                style={{
                  backgroundColor: category?.background,
                  color: category?.text,
                }}
              >
                {category?.name}
              </Badge>
            {/* </Link>
          ))} */}
        </div>
      </div>

      {/* Verified Box */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-gray-700">
            Verified US Non Profit
          </span>
        </div>
        <div className="text-sm text-gray-700">Tax ID Number: {causeData?.tax_id_number}</div>
        <div className="text-sm text-gray-700 mb-1">
          Address: {causeData?.street}, {causeData?.city}, {causeData?.state}
        </div>
        {/* <a to="#" className="text-sm text-blue-600 underline">Claim this non-profit?</a> */}
        <ClaimCauseDialog />
      </div>
      {/* Guarantee Note */}
      <div className="flex items-center gap-1 text-sm ">
        <div className="text-xs  bg-gray-300 rounded-full p-1">
          {" "}
          <ShieldCheck className="w-4 h-4 " />
        </div>
        <p>Your donation is protected and guaranteed.</p>
      </div>
      <Link to="#" className="text-blue-600 underline">
        Learn More
      </Link>

      <SharePost
        url={window.location.origin + `/groupcrwd/`}
        title={`Feed the hungry - CRWD`}
        description="Join us in supporting families experiencing food insecurity in the greater Atlanta area."
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
};

export default CauseProfileCard;
