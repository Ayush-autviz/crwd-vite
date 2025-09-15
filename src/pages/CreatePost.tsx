"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Calendar, ImageIcon, Link, X } from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Select, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";

const CRWDS = [
  { name: "The Red Cross", status: "Joined", image: "/adidas.jpg" },
  { name: "St. Judes", status: "Saved", image: "/benz.jpg" },
  {
    name: "Women's Healthcare of At…",
    status: "Recently visited",
    image: "/maz.jpg",
  },
  {
    name: "Children's Healthcare",
    status: "Recently visited",
    image: "/hy.jpg",
  },
  { name: "Make a Wish", status: "Recently visited", image: "/starbucks.jpg" },
];

type CRWD = {
  name: string;
  status: string;
  image: string;
};

export default function CreatePostPage() {
  const [step, setStep] = useState(1);
  const [selectedCRWD, setSelectedCRWD] = useState<CRWD | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    day: "",
    time: "",
    place: "",
    caption: "",
    content: "",
    url: "",
  });

  // Track which post type is selected
  const [postType, setPostType] = useState<"link" | "image" | "event" | null>(
    null
  );

  // Track selected image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Track URL validation
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear URL error when user starts typing
    if (name === "url" && urlError) {
      setUrlError(null);
    }
  };

  // Validate URL format
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle URL validation
  const handleUrlBlur = () => {
    if (form.url && !validateUrl(form.url)) {
      setUrlError("Oops, this link isn't valid. Double-check, and try again.");
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle post type selection
  const handlePostTypeSelect = (type: "link" | "image" | "event") => {
    setPostType(type);

    // Reset form fields when switching post types
    setForm((prev) => ({
      ...prev,
      url: "",
      title: "",
      day: "",
      time: "",
      place: "",
      caption: "",
    }));

    // Reset image selection
    setSelectedImage(null);
    setImagePreview(null);
    setUrlError(null);

    // Trigger image picker for image posts
    if (type === "image" && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Check if post can be submitted
  const canSubmitPost = () => {
    if (!selectedCRWD || !form.content.trim()) return false;

    switch (postType) {
      case "link":
        return form.url.trim() && validateUrl(form.url) && !urlError;
      case "image":
        return selectedImage !== null;
      case "event":
        return form.title.trim();
      default:
        return false;
    }
  };

  // Step 2: Post to (CRWD selection)
  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ProfileNavbar title="Add a post" />
        <div className="flex items-center p-4 ">
          <button onClick={() => setStep(1)} className="mr-2 flex  text-base">
            <X />
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search for a Giving Circle"
              className="bg-muted/50 rounded-lg px-3 py-2 w-full text-sm border-none focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CRWDS.map((crwd) => (
            <div
              key={crwd.name}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b transition-colors"
              onClick={() => {
                setSelectedCRWD(crwd);
                setStep(1); // Return to step 1 after selecting a CRWD
              }}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={crwd.image}
                  alt={crwd.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium text-base">{crwd.name}</div>
                <div className="text-muted-foreground text-sm">
                  {crwd.status}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center p-4">
          <Button variant="outline" className="w-40">
            See More
          </Button>
        </div>
        {/* Confirmation after selecting a CRWD */}
        {selectedCRWD && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl shadow-lg p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
              <div className="text-3xl">🎉</div>
              <div className="text-xl font-semibold text-center">
                Your post has been created for{" "}
                <span className="text-primary font-bold">
                  {selectedCRWD.name}
                </span>
                !
              </div>
              <Button className="w-full mt-2" onClick={() => navigate("/")}>
                Go to Home
              </Button>
            </div>
          </div>
        )}
        {/* <div className="h-20 md:hidden" /> */}
      </div>
    );
  }

  // Step 1: Create post form
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/40 pb-16">
      <ProfileNavbar title="Add a post" />

      <div className="flex-1 flex flex-col  p-4">
        <div className="flex flex-col p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="w-full">
              {selectedCRWD ? (
                <div
                  className="flex items-center gap-3 w-full sm:w-3/4 md:w-1/2 rounded-lg py-2 cursor-pointer"
                  // onClick={() => setStep(2)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={selectedCRWD.image}
                      alt={selectedCRWD.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium italic text-gray-500">
                    Posting to {selectedCRWD.name}
                  </span>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post to a Giving Circle
                  </label>
                  <Select>
                    <SelectTrigger
                      className="w-full sm:w-3/4 md:w-1/2 rounded-lg border px-4 py-2 text-left shadow-none border-none bg-gray-100"
                      onClick={() => setStep(2)}
                    >
                      <SelectValue
                        placeholder="Select a Giving Circle (required)"
                        className="truncate"
                      />
                    </SelectTrigger>
                  </Select>
                </>
              )}
            </div>

            {/* <Button
              variant="outline"
              className="rounded-lg px-6 py-2 text-sm font-medium mt-2 sm:mt-0"
              onClick={() => setStep(2)}
              disabled={!canSubmitPost()}
            >
              Post
            </Button> */}
          </div>
          <div className="flex-1">
            {selectedCRWD && postType ? (
              <div className="mt-6">
                {/* Title/Content Input - Always shown for all post types */}
                <div className="mb-6">
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleInputChange}
                    placeholder={
                      postType === "link"
                        ? "What's on your mind?"
                        : postType === "image"
                        ? "What's on your mind?"
                        : "What's the name of your event?"
                    }
                    className="w-full min-h-[100px] p-0 border-0 bg-transparent text-lg focus:outline-none resize-none placeholder:text-gray-400"
                  />
                </div>

                {/* URL Input for Link Posts */}
                {postType === "link" && (
                  <div className="mb-6">
                    <div className="relative">
                      <Input
                        name="url"
                        value={form.url}
                        onChange={handleInputChange}
                        onBlur={handleUrlBlur}
                        placeholder="URL"
                        className="border-0 border-b border-gray-300 rounded-none px-0 py-3 text-blue-500 focus-visible:ring-0 focus-visible:border-primary placeholder:text-gray-400"
                      />
                      {form.url && (
                        <button
                          onClick={() =>
                            setForm((prev) => ({ ...prev, url: "" }))
                          }
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm hover:bg-gray-500"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    {urlError && (
                      <div className="text-red-500 text-sm mt-2">
                        {urlError}
                      </div>
                    )}
                  </div>
                )}

                {/* Image Preview for Image Posts */}
                {postType === "image" && selectedImage && imagePreview && (
                  <div className="mb-6">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Selected"
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : selectedCRWD && !postType ? (
              <div className="flex flex-col items-center justify-center  mt-10 px-1">
                <div className="text-gray-400 text-center">
                  <div className="text-lg mb-2">
                    Select a post type below to get started
                  </div>
                  <div className="text-sm">
                    Choose from link, photo, or event
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start justify-start mt-10 px-1">
                {/* <div className="text-xl text-gray-400 font-light mb-3">
                  Start Typing
                </div> */}
                <div className="w-full">
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleInputChange}
                    placeholder="What's on your mind?"
                    className="w-full min-h-[200px] p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
                {/* <div className="text-gray-400 italic text-sm mt-2">
                  You can share an announcement, picture, event, link, etc.
                </div> */}
              </div>
            )}

            {/* Post Type Icons - Always visible below textarea */}
            <div className="mt-6 px-2">
              <div className="flex gap-8 mb-2">
                <button
                  onClick={() => handlePostTypeSelect("link")}
                  className="focus:outline-none"
                >
                  <Link
                    className={`h-6 w-6 ${
                      postType === "link" ? "text-primary" : "text-gray-500"
                    } transition-colors`}
                  />
                </button>
                <button
                  onClick={() => handlePostTypeSelect("image")}
                  className="focus:outline-none"
                >
                  <ImageIcon
                    className={`h-6 w-6 ${
                      postType === "image" ? "text-primary" : "text-gray-500"
                    } transition-colors`}
                  />
                </button>
              </div>
              <div className="text-muted-foreground text-sm italic">
                {postType
                  ? "Add a link or image"
                  : "Select a post type to get started"}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                variant="default"
                className="w-full sm:w-auto rounded-lg px-6 py-2 text-sm font-medium text-white"
                onClick={() => setStep(2)}
                disabled={!canSubmitPost()}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Hidden file input for image selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* <div className="h-20 md:hidden" /> */}
    </div>
  );
}
