interface OrganizationMissionProps {
  causeData: any;
}

export default function OrganizationMission({ causeData }: OrganizationMissionProps) {
  const mission = causeData?.mission || causeData?.description;
  
  if (!mission) {
    return null;
  }

  return (
    <div className="m-4 px-4 py-6 bg-gray-50 rounded-xl">
      <h2 className="text-lg font-bold text-foreground mb-4">Organization Mission</h2>
      <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
        {mission}
      </div>
    </div>
  );
}

