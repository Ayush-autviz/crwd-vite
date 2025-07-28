import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import GroupCrwdHeader from '../components/groupcrwd/GroupCrwdHeader';
import GroupCrwdSuggested from '../components/groupcrwd/GroupCrwdSuggested';
import GroupCrwdUpdates from '../components/groupcrwd/GroupCrwdUpdates';
import GroupCrwdEvent from '../components/groupcrwd/GroupCrwdEvent';
import GroupCrwdBottomBar from '../components/groupcrwd/GroupCrwdBottomBar';
import ProfileNavbar from '@/components/profile/ProfileNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Toast } from '@/components/ui/toast';
import { SharePost } from '@/components/ui/SharePost';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function GroupCrwdByIdPage() {
  const { id } = useParams<{ id: string }>();
  const [hasJoined, setHasJoined] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleJoin = () => {
    if (hasJoined) {
      // If already joined, show confirmation dialog before unjoining
      setShowConfirmDialog(true);
    } else {
      // If not joined, join directly
      setHasJoined(true);
      setShowToast(true);
    }
  };

  const handleConfirmUnjoin = () => {
    setHasJoined(false);
    setShowToast(true);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <ProfileNavbar title={`Group Crwd #${id}`} />
      <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <GroupCrwdHeader hasJoined={hasJoined} onJoin={handleJoin} id={id || ''} />
          <GroupCrwdSuggested />
          <GroupCrwdUpdates showEmpty={false} />
          {!hasJoined && <GroupCrwdBottomBar onJoin={handleJoin} />}
          <div className='h-45 md:hidden'/>
        </div>
      </div>

      <Toast 
        show={showToast}
        onHide={() => setShowToast(false)}
        message={hasJoined ? "You have joined the group" : "You have left the group"}
      />

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this group? You can always join back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmUnjoin}>
              Leave Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 