"use client"
import React, { useState } from 'react';
import SavedItem from './SavedItem';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface SavedData {
  avatar: string;
  title: string;
  subtitle: string;
}

interface SavedListProps {
  items: SavedData[];
  onRemoveItem: (index: number) => void;
}

const SavedList: React.FC<SavedListProps> = ({ items, onRemoveItem }) => {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ index: number; title: string } | null>(null);
  
  const handleItemClick = (e: React.MouseEvent, index: number) => {
    // Check if the click was on the bookmark icon
    if ((e.target as HTMLElement).closest('.bookmark-icon')) {
      e.stopPropagation();
      setItemToRemove({ index, title: items[index].title });
      setShowConfirmDialog(true);
    } else {
      navigate(`/cause`);
    }
  };

  const handleConfirmUnsave = () => {
    if (itemToRemove !== null) {
      onRemoveItem(itemToRemove.index);
    }
    setShowConfirmDialog(false);
    setItemToRemove(null);
  };

  const handleCancelUnsave = () => {
    setShowConfirmDialog(false);
    setItemToRemove(null);
  };

  return (
    <>
      <div className="flex flex-col gap-1 pt-2">
        {items?.map((item, i) => (
          <div key={i} onClick={(e) => handleItemClick(e, i)} className="cursor-pointer">
            <SavedItem {...item} />
          </div>
        ))}
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unsave Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to unsave "{itemToRemove?.title}"? This will remove it from your saved items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={handleCancelUnsave}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleConfirmUnsave}
            >
              Unsave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
};

export default SavedList; 