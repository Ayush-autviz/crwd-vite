"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { ImageIcon, Link, X, Loader2 } from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Footer from "@/components/Footer";
import { Toast } from "@/components/ui/toast";
import { useMutation } from "@tanstack/react-query";
import { createPost } from "@/services/api/social";


export default function CreatePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get collective_id from location state
  const collectiveData = location.state?.collectiveData;
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [form, setForm] = useState({
    
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

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (response) => {
      console.log('Post created successfully:', response);
      setToastMessage("Post created successfully!");
      setShowToast(true);
      // Navigate back to the collective page or home
      setTimeout(() => {
        navigate(-1); // Go back to previous page
      }, 1500);
    },
    onError: (error: any) => {
      console.error('Error creating post:', error);
      setToastMessage("Failed to create post. Please try again.");
      setShowToast(true);
    },
  });

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
    // Post can be submitted with just content (text-only post)
    if (!form.content.trim()) return false;
    
    // If link type is selected, URL must be provided and valid
    if (postType === "link") {
      return form.url.trim() && validateUrl(form.url) && !urlError;
    }
    
    // If image type is selected, image must be provided
    if (postType === "image") {
      return selectedImage !== null;
    }
    
    // Text-only post or event post (just needs content)
    return true;
  };

  // Handle form submission
  const handleSubmitPost = () => {
    if (!canSubmitPost() || createPostMutation.isPending) return;

    const formData = new FormData();
    formData.append('collective_id', collectiveData.id.toString());
    formData.append('content', form.content);

    // Add media file if it's an image post
    if (postType === "image" && selectedImage) {
      formData.append('media_file', selectedImage);
    }
    
    // Add media_url if URL is provided (for link posts or when URL is filled)
    if (form.url.trim() && validateUrl(form.url)) {
      formData.append('media_url', form.url);
    }

    createPostMutation.mutate(formData);
  };

  // Check if collective_id is provided
  if (!collectiveData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ProfileNavbar title="Create a Post" />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">
              No Collective Selected
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Please select a collective to create a post.
            </div>
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main create post form
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/40 ">
      <ProfileNavbar title="Create a Post" />

      <div className="flex-1 flex flex-col  p-4">
        <div className="flex flex-col p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="w-full">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Creating post for {collectiveData.name}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            {/* {postType ? ( */}
              <div className="mt-6">
                {/* Title/Content Input - Always shown for all post types */}
                <div className="mb-6">
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleInputChange}
                    placeholder={
                     "What's on your mind?"
                     
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
            {/* ) : (
              <div className="flex flex-col items-center justify-center mt-10 px-1">
                <div className="text-gray-400 text-center">
                  <div className="text-lg mb-2">
                    Select a post type below to get started
                  </div>
                  <div className="text-sm">
                    Choose from link, photo
                  </div>
                </div>
              </div>
            )} */}

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
                onClick={handleSubmitPost}
                disabled={!canSubmitPost() || createPostMutation.isPending}
              >
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Post"
                )}
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

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />

      {/* <div className="h-20 md:hidden" /> */}

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
