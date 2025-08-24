import React, { useState, useRef } from "react";
import { Check, Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function ClaimProfile() {
  const [checked, setChecked] = useState(false);
  const [date, setDate] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleContinue = () => {
    // Navigate to AddPhoto for web
    navigate("/non-profit-interests");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] [background-size:20px_20px]"></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center p-4 md:p-8 min-h-screen">
        <div className="w-full max-w-md">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-8 space-y-6">
              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-12 h-1 bg-black rounded-full"></div>
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Finish your profile
                </h1>
                <p className="text-gray-600 text-sm">
                  So others can connect with you on CRWD
                </p>
              </div>

              {/* Add Photo Section */}
              <div className="text-center space-y-3">
                <div className="relative mx-auto">
                  {selectedImage ? (
                    <div className="w-24 h-24 rounded-full border-2 border-gray-300 overflow-hidden relative group mx-auto">
                      <img
                        src={selectedImage}
                        alt="Profile"
                        className="w-full h-full object-cover "
                      />
                      {/* Remove button overlay */}
                      {/* <button
                        onClick={handleRemovePhoto}
                        className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X size={14} />
                      </button> */}
                    </div>
                  ) : (
                    <button
                      onClick={handleUploadClick}
                      className="w-24 h-24 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center mx-auto"
                    >
                      <Camera size={32} className="text-gray-500" />
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Add a Photo
                  </p>
                  <p className="text-xs text-gray-500">OPTIONAL</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md px-3 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 transition-colors duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="janedoe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md px-3 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 transition-colors duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full h-10 border border-gray-300 rounded-md px-3 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-center gap-3">
                <button
                  className={`w-5 h-5 border-2 rounded-full transition-all flex-shrink-0 ${
                    checked
                      ? "border-gray-900 bg-gray-900"
                      : "border-gray-300 bg-white"
                  }`}
                  onClick={() => setChecked(!checked)}
                >
                  {checked && <Check size={12} className="text-white m-auto" />}
                </button>

                <div className="flex-1">
                  <p className="text-sm text-gray-600 leading-5">
                    By checking this box, you acknowledge and agree to CRWD's
                    Terms of Use and Privacy Policy.
                  </p>
                </div>
              </div>

              {/* Continue button */}
              <div className="pt-2">
                <button
                  className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center"
                  onClick={handleContinue}
                >
                  Continue
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
