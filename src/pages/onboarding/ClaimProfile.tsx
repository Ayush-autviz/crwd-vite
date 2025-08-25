import React, { useState, useRef } from "react";
import { Check, Camera, X, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "antd";
import type { DatePickerProps } from "antd";

export default function ClaimProfile() {
  const [checked, setChecked] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
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
    navigate("/non-profit-interests");
  };

  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    setDate(date?.toDate() || null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] [background-size:20px_20px]"></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center p-4  min-h-screen">
        <div className="w-full max-w-md">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-4 space-y-4">
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
                <h1 className="text-2xl font-bold text-gray-900">
                  Finish your profile
                </h1>
                <p className="text-gray-600 font-semibold text-sm">
                  So others can connect with you on CRWD
                </p>
              </div>

              {/* Add Photo Section */}
              <div className="text-center space-y-4">
                <div className="relative mx-auto">
                  {selectedImage ? (
                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden relative mx-auto">
                      <img
                        src={selectedImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={handleRemovePhoto}
                        className="absolute top-1 right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleUploadClick}
                      className="w-20 h-20 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center mx-auto hover:border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      <Camera size={20} className="text-gray-400" />
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Add a Photo
                  </p>
                  <p className="text-xs text-gray-500">OPTIONAL</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg px-3 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="janedoe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg px-3 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Date of birth
                  </label>
                  <DatePicker
                    onChange={onChange}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                    placeholder="Select date"
                  />
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-center gap-3 p-4 ">
                <button
                  className={`w-5 h-5 border-2 rounded-full transition-all flex-shrink-0 mt-0.5 ${
                    checked
                      ? "border-gray-900 bg-gray-900"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                  onClick={() => setChecked(!checked)}
                >
                  {checked && <Check size={12} className="text-white m-auto" />}
                </button>

                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-5">
                    By checking this box, you acknowledge and agree to CRWD's
                    <span className="text-gray-900 font-medium">
                      {" "}
                      Terms of Use{" "}
                    </span>
                    and
                    <span className="text-gray-900 font-medium">
                      {" "}
                      Privacy Policy
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* Continue Button */}
              <button
                className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                onClick={handleContinue}
              >
                Continue
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
