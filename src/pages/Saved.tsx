import { useState } from "react";
import SavedList, { SavedData } from "@/components/saved/SavedList";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Toast } from "@/components/ui/toast";

const initialSavedItems: SavedData[] = [
  {
    // avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Red_Cross_logo.svg/1200px-Red_Cross_logo.svg.png',
    avatar: "/redcross.png",
    title: "The Red Cross",
    subtitle: "An health organization that provides food to the needy.",
  },
  {
    // avatar: 'https://www.stjude.org/content/dam/en_US/shared/www/logos/st-jude-logo.png',
    avatar: "/grocery.jpg",
    title: "St. Judes",
    subtitle:
      "The leading children's health organization that provides food to the needy.",
  },
  {
    // avatar: 'https://www.whatlittlebirdie.com/wp-content/uploads/2021/09/atlanta-womens-healthcare.jpg',
    avatar: "/redcross.png",
    title: "Women's Healthcare of Atlanta",
    subtitle:
      "We are Atlanta's #1 healthca organization that provides food to the needy.",
  },
];

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<SavedData[]>(initialSavedItems);
  const [showToast, setShowToast] = useState(false);

  const handleRemoveItem = (index: number) => {
    setSavedItems((prevItems) => prevItems.filter((_, i) => i !== index));
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <ProfileNavbar title="Favorites" />
      <SavedList items={savedItems} onRemoveItem={handleRemoveItem} />
      <Toast
        message="Removed from Favorites"
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
}
