"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { ImageIcon, X, Loader2, ArrowLeft, Lightbulb, Paperclip } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createPost, getLinkPreview } from "@/services/api/social";
import { useAuthStore } from "@/stores/store";
import Cropper, { Area } from "react-easy-crop";


export default function CreatePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

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

  // Crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Track URL validation
  const [urlError, setUrlError] = useState<string | null>(null);

  // Track link preview
  const [showPreview, setShowPreview] = useState(false);

  // Validate URL format - defined before useQuery
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Fetch link preview automatically when URL is valid
  const { data: previewData, isLoading: isLoadingPreview, refetch: fetchPreview } = useQuery({
    queryKey: ['link-preview', form.url],
    queryFn: () => getLinkPreview(form.url),
    enabled: form.url.trim().length > 0 && validateUrl(form.url) && !urlError,
  });

  // Show preview when data is available
  useEffect(() => {
    if (previewData && form.url && validateUrl(form.url) && !urlError) {
      setShowPreview(true);
    } else if (!form.url || !validateUrl(form.url) || urlError) {
      setShowPreview(false);
    }
  }, [previewData, form.url, urlError]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (response) => {
      console.log('Post created successfully:', response);
      setToastMessage("Post created successfully!");
      setShowToast(true);

      // Invalidate posts queries to refresh the list
      if (collectiveData?.id) {
        // Invalidate posts for the specific collective
        queryClient.invalidateQueries({ queryKey: ['posts', collectiveData.id.toString()] });
      }
      // Also invalidate all posts query to refresh home page and other places
      queryClient.invalidateQueries({ queryKey: ['posts'] });

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

  // Handle URL validation
  const handleUrlBlur = () => {
    if (form.url && !validateUrl(form.url)) {
      setUrlError("Oops, this link isn't valid. Double-check, and try again.");
    }
  };

  // Create cropped image utility function
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropComplete = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "cropped-image.jpg", {
        type: "image/jpeg",
      });
      
      setSelectedImage(croppedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(croppedFile);
      
      setShowCropModal(false);
      setCropImageSrc("");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error("Error cropping image:", error);
      setToastMessage("Failed to crop image. Please try again.");
      setShowToast(true);
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setCropImageSrc(imageSrc);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = "";
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

    // If URL is provided, it must be valid
    if (form.url.trim() && (!validateUrl(form.url) || urlError)) {
      return false;
    }

    // Allow text-only posts, posts with image, posts with link, or any combination
    // Image and link are optional
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

  if (!currentUser?.id) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Create Post</h1>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">
              Sign in to create a post
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Sign in to create a post, manage your causes, and connect with your community.
            </div>
            <Button onClick={() => navigate('/login')}>
              Sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if collective_id is provided
  if (!collectiveData) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Create Post</h1>
          </div>
        </div>
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
  const characterCount = form.content.length;
  const maxCharacters = 500;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Create Post</h1>
              <p className="text-xs text-gray-500">{collectiveData?.name || "Your Collective"}</p>
            </div>
          </div>
          <Button
            onClick={handleSubmitPost}
            disabled={!canSubmitPost() || createPostMutation.isPending}
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white px-6 py-2 rounded-lg font-medium"
          >
            {createPostMutation.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Main Content Input */}
        <div className="mb-6">
          <div className="border-2 rounded-lg p-4 bg-gray-50 border-gray-300 transition-all">
            <textarea
              name="content"
              value={form.content}
              onChange={handleInputChange}
              placeholder="What's on your mind?"
              className="w-full min-h-[200px] p-0 border-0 bg-transparent text-base focus:outline-none resize-none placeholder:text-gray-400"
              maxLength={maxCharacters}
            />
          </div>
          {/* Character Count */}
          <div className="flex justify-end mt-2">
            <span className="text-xs text-gray-500">
              {characterCount}/{maxCharacters}
            </span>
          </div>
        </div>

        {/* Add Image and Add Link Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => handlePostTypeSelect("image")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Add Image</span>
          </button>
          <button
            onClick={() => handlePostTypeSelect("link")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Add Link</span>
          </button>
        </div>

        {/* Link Input Field - Show when link is selected or URL is entered */}
        {(postType === "link" || form.url) && (
          <div className="mb-4">
            <div className="relative border border-gray-300 rounded-lg">
              <Input
                name="url"
                value={form.url}
                onChange={handleInputChange}
                onBlur={handleUrlBlur}
                placeholder="https://example.com/article"
                className={`px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1600ff] focus:border-transparent w-full ${form.url ? 'pr-10' : ''}`}
              />
              {form.url && (
                <button
                  onClick={() => {
                    setForm((prev) => ({ ...prev, url: "" }));
                    if (postType === "link") setPostType(null);
                    setShowPreview(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {urlError && (
              <div className="text-red-500 text-sm mt-2">
                {urlError}
              </div>
            )}
            {/* Preview Button - Manual refresh */}
            {form.url && validateUrl(form.url) && !urlError && (
              <button
                onClick={() => {
                  fetchPreview();
                }}
                disabled={isLoadingPreview}
                className="mt-2 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingPreview ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm font-medium text-gray-700">Loading Preview...</span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-gray-700">Refresh Preview</span>
                )}
              </button>
            )}
            {/* Link Preview Card */}
            {showPreview && previewData && !isLoadingPreview && (
              <div className="mt-4 w-full rounded-lg overflow-hidden border border-gray-200 bg-white">
                <div className="flex flex-col md:flex-row bg-white">
                  {/* Preview Image */}
                  {previewData.image && (
                    <div className="w-full md:w-48 h-[180px] md:h-[200px] lg:h-auto flex-shrink-0">
                      <img
                        src={previewData.image}
                        alt={previewData.title || 'Link preview'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {/* Preview Content */}
                  <div className="flex-1 p-2.5 md:p-3">
                    {previewData.site_name && (
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
                        {previewData.site_name}
                      </div>
                    )}
                    {previewData.title && (
                      <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-0.5 md:mb-1 line-clamp-2">
                        {previewData.title}
                      </h3>
                    )}
                    {previewData.description && (
                      <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1 line-clamp-2">
                        {previewData.description}
                      </p>
                    )}
                    {previewData.domain && (
                      <div className="text-[10px] md:text-[11px] text-gray-500 truncate">
                        {previewData.domain}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Preview */}
        {selectedImage && imagePreview && (
          <div className="mb-4">
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 mx-auto" style={{ maxWidth: '600px' }}>
              <img
                src={imagePreview}
                alt="Selected"
                className="w-full h-[140px] md:h-[200px] object-cover"
                style={{ objectPosition: 'center' }}
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  if (postType === "image") setPostType(null);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Posting Tips Box */}
        <div className="mt-auto bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-900">Posting Tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Share inspiring stories about the causes you support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Post updates about your collective's impact</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Include relevant articles or resources to engage members</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Text-only posts are perfect for quick updates!</span>
            </li>
          </ul>
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

      {/* Crop Modal */}
      {showCropModal && cropImageSrc && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex flex-col">
          <div className="flex-1 relative">
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={600 / 200}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  position: "relative",
                },
              }}
            />
          </div>
          <div className="bg-black p-4 flex items-center justify-between">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 mr-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowCropModal(false);
                  setCropImageSrc("");
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setCroppedAreaPixels(null);
                }}
                variant="outline"
                className="bg-white text-black hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCropComplete}
                className="bg-[#1600ff] hover:bg-[#1400cc] text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
