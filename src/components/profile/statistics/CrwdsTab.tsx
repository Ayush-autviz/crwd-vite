import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function CrwdsTab({ crwds }: { crwds: { name: string; avatar: string; role: string }[] }) {
  return (
    <div className="space-y-4">
      {crwds.map((crwd) => (
        <div key={crwd.name} className="flex items-center bg-white border border-blue-200 rounded-lg shadow-sm p-4">
          <Avatar className="w-12 h-12 mr-4">
            <AvatarImage src={crwd.avatar} />
            <AvatarFallback>{crwd.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-base text-blue-900">{crwd.name}</div>
            <div className="text-xs text-blue-600 font-medium">{crwd.role}</div>
          </div>
          <button className="ml-4 px-4 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition">View</button>
        </div>
      ))}
    </div>
  );
} 