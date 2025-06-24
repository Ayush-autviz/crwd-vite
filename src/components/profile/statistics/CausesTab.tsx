import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function getImpactType(impact: string) {
  if (impact.toLowerCase().includes("donated")) return "Donation";
  if (impact.toLowerCase().includes("volunteer")) return "Volunteer";
  if (impact.toLowerCase().includes("share")) return "Share";
  return "Impact";
}

export default function CausesTab({ causes }: { causes: { name: string; avatar: string; impact: string }[] }) {
  return (
    <div className="space-y-4">
      {causes.map((cause, i) => (
        <div key={cause.name} className="flex flex-col md:flex-row items-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow p-5 gap-4">
          <Avatar className="w-14 h-14 mr-0 md:mr-6">
            <AvatarImage src={cause.avatar} />
            <AvatarFallback>{cause.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-lg text-blue-900">{cause.name}</span>
              <span className="px-2 py-0.5 rounded bg-blue-200 text-xs text-blue-800 font-medium">{getImpactType(cause.impact)}</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">{cause.impact}</div>
            {/* Demo progress bar */}
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${60 + i * 10}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 