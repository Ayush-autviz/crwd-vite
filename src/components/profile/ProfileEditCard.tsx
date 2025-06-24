import React, { useState, useRef } from 'react';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Edit2, Check, X, Camera } from 'lucide-react';

interface ProfileEditCardProps {
  avatarUrl: string;
  name: string;
  username: string;
  location: string;
  bio: string;
  onSave?: (data: { name: string; username: string; location: string; bio: string; avatarUrl?: string }) => void;
}

/**
 * ProfileEditCard - An interactive profile editing component
 *
 * Features:
 * - Click edit icon to edit any field inline
 * - Image upload with preview
 * - Keyboard shortcuts: Enter to save, Escape to cancel, Ctrl+Enter for textarea
 * - Basic validation for name and username
 * - Auto-focus on edit inputs
 * - Success feedback via toast notifications
 */

const ProfileEditCard: React.FC<ProfileEditCardProps> = ({
  avatarUrl,
  name,
  username,
  location,
  bio,
  onSave
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name,
    username,
    location,
    bio,
    avatarUrl
  });
  const [tempData, setTempData] = useState({
    name,
    username,
    location,
    bio
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

    // Call onSave callback if provided
    if (onSave) {
      onSave({
        ...formData,
        [field]: value
      });
    }
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

        if (onSave) {
          onSave({
            name: formData.name,
            username: formData.username,
            location: formData.location,
            bio: formData.bio,
            avatarUrl: newAvatarUrl
          });
        }
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
    <div className="w-full max-w-full mx-auto bg-white overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6 px-4">
        <div className="relative">
          <Avatar className="w-16 h-16 mb-2">
            <AvatarImage src={formData.avatarUrl} alt={formData.name} />
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Camera size={12} />
          </button>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm font-semibold text-gray-800 hover:underline"
        >
          Edit picture
        </button>
      </div>

      {/* Editable Fields */}
      <div className="divide-y divide-gray-300 border-b border-t overflow-hidden">
        {renderField('name', 'Name', formData.name)}
        {renderField('username', 'Username', formData.username)}
        {renderField('location', 'Location', formData.location)}
        {renderField('bio', 'Bio', formData.bio, true)}
      </div>
    </div>
  );
};

export default ProfileEditCard;