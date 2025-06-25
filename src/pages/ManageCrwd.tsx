"use client";
import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useRef } from 'react';
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X, Camera, Trash2, ChevronRight } from 'lucide-react';
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { toast } from 'sonner';
import { Link } from "react-router-dom";

const mockCrwd = {
  name: "Feed The Hungry",
  username: "Feedthehungry",
  location: "Las Cruces, NM",
  bio: "This is a bio about feed the hungry. they are foodies on a mission to solve world hunger, one meal at a time.",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg"
};

const currentlySupporting = [
  { name: "Red Cross", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "St. Judes", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Community First", avatar: "https://randomuser.me/api/portraits/men/65.jpg" },
  { name: "Make a Wish", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Planned", avatar: "https://randomuser.me/api/portraits/men/12.jpg" },
  { name: "Made with Love", avatar: "https://randomuser.me/api/portraits/women/22.jpg" }
];
const previouslySupported = [
  { name: "W.H. Initiative", avatar: "https://randomuser.me/api/portraits/men/23.jpg" },
  { name: "Global Relief", avatar: "https://randomuser.me/api/portraits/women/24.jpg" },
  { name: "Food for All", avatar: "https://randomuser.me/api/portraits/men/25.jpg" },
  { name: "Hope Foundation", avatar: "https://randomuser.me/api/portraits/women/26.jpg" },
  { name: "Shelter Now", avatar: "https://randomuser.me/api/portraits/men/27.jpg" },
  { name: "Clean Water Project", avatar: "https://randomuser.me/api/portraits/women/28.jpg" },
];

export default function ManageCrwd() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: mockCrwd.name,
    username: mockCrwd.username,
    location: mockCrwd.location,
    bio: mockCrwd.bio,
    avatarUrl: mockCrwd.avatar
  });
  const [tempData, setTempData] = useState({
    name: mockCrwd.name,
    username: mockCrwd.username,
    location: mockCrwd.location,
    bio: mockCrwd.bio
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (field: string) => {
    setEditingField(field);
    setTempData(prev => ({ ...prev, [field]: formData[field as keyof typeof formData] }));
  };

  const handleSave = (field: string) => {
    const value = tempData[field as keyof typeof tempData];

    // Basic validation
    if (field === 'name' && !value.trim()) {
      return; // Don't save empty names
    }

    if (field === 'username' && value.trim() && !value.trim().match(/^[a-zA-Z0-9_]+$/)) {
      return; // Username should only contain letters, numbers, and underscores
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    setEditingField(null);

    // Show success message
    toast.success('CRWD updated successfully!');
    console.log('Saving CRWD data:', { ...formData, [field]: value });
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempData({
      name: formData.name,
      username: formData.username,
      location: formData.location,
      bio: formData.bio
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatarUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
        toast.success('CRWD picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const renderField = (field: string, label: string, value: string, isTextarea = false) => {
    const isCurrentlyEditing = editingField === field;

    return (
      <div className={`flex ${isTextarea ? 'items-start' : 'items-center'} px-4 py-4`}>
        <div className="w-1/3 text-gray-700 font-medium">{label}</div>
        <div className="w-2/3 flex items-center gap-2 min-w-0">
          {isCurrentlyEditing ? (
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {isTextarea ? (
                <Textarea
                  value={tempData[field as keyof typeof tempData]}
                  onChange={(e) => setTempData(prev => ({ ...prev, [field]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSave(field);
                    } else if (e.key === 'Escape') {
                      handleCancel();
                    }
                  }}
                  className="flex-1 min-h-[80px] max-h-[200px] resize-none w-full overflow-y-auto break-words"
                  placeholder={`Enter ${label.toLowerCase()}...`}
                  autoFocus
                />
              ) : (
                <Input
                  value={tempData[field as keyof typeof tempData]}
                  onChange={(e) => setTempData(prev => ({ ...prev, [field]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave(field);
                    } else if (e.key === 'Escape') {
                      handleCancel();
                    }
                  }}
                  className="flex-1 w-full min-w-0"
                  placeholder={`Enter ${label.toLowerCase()}...`}
                  autoFocus
                />
              )}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSave(field)}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className={`text-gray-900 font-normal flex-1 min-w-0 ${
                isTextarea
                  ? 'whitespace-pre-line break-words'
                  : 'truncate'
              }`}>
                {value || `No ${label.toLowerCase()} set`}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(field)}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <Edit2 size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-start space-y-6 min-h-screen">
      <ProfileNavbar title="Edit CRWD" titleClassName="text-2xl" />
      <div className="w-full">
        <div className="w-full max-w-full mx-auto bg-white overflow-hidden">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Header Section */}
          <div className="relative  p-4 border-b border-gray-200">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage 
                    src={formData.avatarUrl} 
                    alt={formData.name}
                    className="object-cover"
                  />
                </Avatar>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  variant="outline"
                  className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full bg-white border-2 hover:bg-gray-50"
                >
                  <Camera size={16} />
                </Button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{formData.name}</h1>
              <p className="text-gray-600">@{formData.username}</p>
            </div>
          </div>

          {/* Edit Fields Section */}
          <div className="divide-y divide-gray-200">
            {renderField('name', 'Name', formData.name)}
            {renderField('username', 'Username', formData.username)}
            {renderField('location', 'Location', formData.location)}
            {renderField('bio', 'Bio', formData.bio, true)}
          </div>

          {/* Currently Supporting Section */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Currently Supporting</h3>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                <ChevronRight size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentlySupporting.map((org, index) => (
                <div key={index} className="flex items-center bg-white rounded-full p-1 pr-3 shadow-sm">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={org.avatar} alt={org.name} />
                  </Avatar>
                  <span className="text-sm text-gray-700">{org.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Previously Supported Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Previously Supported</h3>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                <ChevronRight size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {previouslySupported.map((org, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full p-1 pr-3">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={org.avatar} alt={org.name} />
                  </Avatar>
                  <span className="text-sm text-gray-600">{org.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <Button
                onClick={() => navigate(-1)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                className="px-6 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-2" />
                Delete CRWD
              </Button>
            </div>
          </div>

          {/* Settings Link */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <Link to="/settings" className="flex items-center text-gray-600 hover:text-gray-800">
              <span className="text-sm">Advanced Settings</span>
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
      <div className="h-30 md:hidden"/>
    </div>
  );
} 