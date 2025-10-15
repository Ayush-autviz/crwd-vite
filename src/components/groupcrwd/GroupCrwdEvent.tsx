import React, { useState } from "react";
import { MoreHorizontal, Heart, MessageCircle } from "lucide-react";
import { IoArrowRedoOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useFavorites } from "../../contexts/FavoritesContext";
import { Toast } from "../ui/toast";

const GroupCrwdEvent: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { toggleFavorite, isFavorite } = useFavorites();
  const eventId = "event-grocery-spot-cleanup"; // Unique ID for this event

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasAdded = toggleFavorite(eventId);
    if (wasAdded) {
      setToastMessage("Added to favorites");
    } else {
      setToastMessage("Removed from favorites");
    }
    setShowToast(true);
  };

  return (
    <>
      <Link to="/post/1">
        <div className="px-4 pt-2  lg:max-w-[630px] gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Chad"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span className="font-semibold text-sm ps-1">@Chad</span>
                <span className="text-xs text-gray-400">• 17h</span>
              </div>
              <button className="text-gray-400">
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div className="ps-12">
              <div className="font-semibold text-base">
                Grocery Spot Cleanup
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-700">
                <span>
                  <span className="font-semibold">Date</span> 3/8/2025
                </span>
                <span>
                  <span className="font-semibold">Time</span> 7:00 am
                </span>
                <span>
                  <span className="font-semibold">RSVP</span> 8
                </span>
                <span>
                  <span className="font-semibold">Maybe</span> 17
                </span>
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-semibold">Place</span> 123 Main St.
                Somewhere, USA
              </div>
              <div className="text-sm text-gray-700">
                Join us this saturday! We'll carpool
              </div>
              <div className="flex items-center justify-between gap-6 text-xs text-gray-500 pt-3">
                <span className="flex items-center gap-6">
                  <button
                    onClick={handleFavoriteClick}
                    className="flex items-center gap-1 hover:text-red-500 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavorite(eventId) ? "fill-red-500 text-red-500" : ""
                      }`}
                      size={16}
                    />{" "}
                    2
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={16} /> 0
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <IoArrowRedoOutline className="w-4 h-4" /> 3
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </>
  );
};

export default GroupCrwdEvent;
