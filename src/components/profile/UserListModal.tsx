import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import type { UserType } from '@/lib/types';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: UserType[];
}

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, title, users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>(users);

  // Reset search when modal opens or users change
  useEffect(() => {
    setSearchTerm('');
    setFilteredUsers(users);
  }, [isOpen, users]);

  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(lowercasedSearch) ||
            user.username.toLowerCase().includes(lowercasedSearch)
        )
      );
    }
  }, [searchTerm, users]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            className="pl-9 bg-muted/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm ? `No ${title.toLowerCase()} matching "${searchTerm}"` : `No ${title.toLowerCase()} to display`}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                    </div>
                  </div>
                  {title === 'Followers' || title === 'Following' ? (
                    <Button
                      variant={user.isFollowing ? "outline" : "default"}
                      size="sm"
                      className="rounded-full"
                    >
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="rounded-full">
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserListModal;
