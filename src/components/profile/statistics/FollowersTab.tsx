import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type User = {
  name: string;
  avatar: string;
};

export default function FollowersTab({ followers }: { followers: User[] }) {
  return (
    <div className="space-y-4">
      {followers.map((user) => (
        <div key={user.name} className="flex items-center bg-white rounded-lg shadow p-4">
          <Avatar className="w-10 h-10 mr-4">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="font-medium text-base">{user.name}</div>
        </div>
      ))}
    </div>
  );
} 