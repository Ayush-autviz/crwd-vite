interface OrganizationMissionProps {
  causeData: any;
}

export default function OrganizationMission({ causeData }: OrganizationMissionProps) {
  const mission = causeData?.mission || causeData?.description;

  if (!mission) {
    return null;
  }

  return (
    <div className="m-3 md:m-4 px-3 md:px-4 py-4 md:py-6 bg-gray-50 rounded-xl">
      <h2 className="text-base xs:text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">Organization Mission</h2>
      <div className="text-xs xs:text-base md:text-lg text-foreground leading-relaxed whitespace-pre-line">
        {mission}
      </div>
    </div>
  );
}

