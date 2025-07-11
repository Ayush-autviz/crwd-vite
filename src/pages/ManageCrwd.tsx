"use client";
import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useRef } from 'react';
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X, Camera, Trash2, ChevronRight, Plus, Minus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Toast } from "@/components/ui/toast";
import { Link } from "react-router-dom";
import BackButton from "@/components/ui/BackButton";

// Add type for Cause
type Cause = {
  name: string;
  avatar: string;
};

// Add available causes data
const allAvailableCauses: Cause[] = [
  { name: "Save the Children", avatar: "https://randomuser.me/api/portraits/men/29.jpg" },
  { name: "UNICEF", avatar: "https://randomuser.me/api/portraits/women/30.jpg" },
  { name: "World Food Program", avatar: "https://randomuser.me/api/portraits/men/31.jpg" },
  { name: "Doctors Without Borders", avatar: "https://randomuser.me/api/portraits/women/32.jpg" },
  { name: "Habitat for Humanity", avatar: "https://randomuser.me/api/portraits/men/33.jpg" },
  { name: "Ocean Cleanup", avatar: "https://randomuser.me/api/portraits/women/34.jpg" }
];

const mockCrwd = {
  name: "Feed The Hungry",
  username: "Feedthehungry",
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
  const [currentModal, setCurrentModal] = useState<'current' | 'previous' | null>(null);
  const [currentlySupportingList, setCurrentlySupportingList] = useState(currentlySupporting);
  const [previouslySupportedList, setPreviouslySupportedList] = useState(previouslySupported);
  const [toastState, setToastState] = useState({ show: false, message: '' });
  const [formData, setFormData] = useState({
    name: mockCrwd.name,
    username: mockCrwd.username,
    bio: mockCrwd.bio,
    avatarUrl: mockCrwd.avatar
  });
  const [tempData, setTempData] = useState({
    name: mockCrwd.name,
    username: mockCrwd.username,
    bio: mockCrwd.bio
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddCauses, setShowAddCauses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter available causes
  const filteredCauses = allAvailableCauses.filter(cause => 
    cause.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !currentlySupportingList.some(item => item.name === cause.name) &&
    !previouslySupportedList.some(item => item.name === cause.name)
  );

  const handleAddNewCause = (cause: Cause) => {
    if (!currentlySupportingList.some(item => item.name === cause.name)) {
      setCurrentlySupportingList(prev => [...prev, cause]);
      showToast(`Added ${cause.name} to currently supporting`);
    }
    setShowAddCauses(false);
  };

  const showToast = (message: string) => {
    setToastState({ show: true, message });
    setTimeout(() => setToastState({ show: false, message: '' }), 1500);
  };

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
    showToast('CRWD updated successfully!');
    console.log('Saving CRWD data:', { ...formData, [field]: value });
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempData({
      name: formData.name,
      username: formData.username,
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
        showToast('CRWD picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFromCurrently = (org: typeof currentlySupporting[0]) => {
    setCurrentlySupportingList(prev => prev.filter(item => item.name !== org.name));
    setPreviouslySupportedList(prev => [...prev, org]);
    setCurrentModal(null);
    showToast(`Removed ${org.name} from currently supporting`);
  };

  const handleAddToCurrent = (org: typeof previouslySupported[0]) => {
    setPreviouslySupportedList(prev => prev.filter(item => item.name !== org.name));
    setCurrentlySupportingList(prev => [...prev, org]);
    setCurrentModal(null);
    showToast(`Added ${org.name} to currently supporting`);
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

  const renderCauseSection = (title: string, causes: Cause[], isPrevious = false) => {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-900 font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            {!isPrevious && (
              <div
   
                onClick={() => setShowAddCauses(true)}
                className="h-8 w-8 p-0 justify-center items-center flex"
              >
                <Plus size={16} />
              </div>
            )}
            <div
              
            
              onClick={() => setCurrentModal(isPrevious ? 'previous' : 'current')}
              className="h-8 w-8 p-0 justify-center items-center flex"
            >
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {causes.map((cause, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                isPrevious ? 'bg-gray-100' : 'bg-white'
              } shadow-sm`}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={cause.avatar} alt={cause.name} />
              </Avatar>
              <span className={`text-sm ${isPrevious ? 'text-gray-600' : 'text-gray-900'}`}>
                {cause.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Add new modal for adding causes
  const renderAddCausesModal = () => {
    return (
      <Dialog open={showAddCauses} onOpenChange={setShowAddCauses}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Causes</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <div className="flex items-center border rounded-md px-3 py-2 mb-4">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <Input
                type="text"
                placeholder="Search causes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 p-0 focus-visible:ring-0 shadow-none"
              />
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {filteredCauses.map((cause, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={cause.avatar} alt={cause.name} />
                    </Avatar>
                    <span className="font-medium text-gray-900">{cause.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddNewCause(cause)}
                    className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                  >
                    Add
                  </Button>
                </div>
              ))}
              {filteredCauses.length === 0 && (
                <p className="text-center text-gray-500 py-4">No causes found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-start space-y-6 min-h-screen">
      <Toast 
        show={toastState.show}
        message={toastState.message}
        onHide={() => setToastState({ show: false, message: '' })}
      />
      <ProfileNavbar title="Edit CRWD" titleClassName="text-2xl" />
      <div className="w-full">
        <div className="w-full max-w-full mx-auto bg-white overflow-hidden">
          {/* Back Button */}
          {/* <div className="px-4 pt-4 mb-6">
            <BackButton variant="outlined" />
          </div> */}

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
            {renderField('bio', 'Bio', formData.bio, true)}
          </div>

          {/* Currently Supporting Section */}
          {renderCauseSection('Currently supporting', currentlySupportingList)}

          {/* Previously Supported Section */}
          {renderCauseSection('Previously Supported', previouslySupportedList, true)}

          {/* Modals */}
          <Dialog open={currentModal === 'current'} onOpenChange={() => setCurrentModal(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Manage Currently Supporting</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                {currentlySupportingList.map((org, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={org.avatar} alt={org.name} />
                      </Avatar>
                      <span className="font-medium text-gray-900">{org.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFromCurrently(org)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={currentModal === 'previous'} onOpenChange={() => setCurrentModal(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Manage Previously Supported</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                {previouslySupportedList.map((org, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={org.avatar} alt={org.name} />
                      </Avatar>
                      <span className="font-medium text-gray-900">{org.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddToCurrent(org)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

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
        </div>
      </div>
      {renderAddCausesModal()}
      <div className="h-30 md:hidden"/>
    </div>
  );
} 