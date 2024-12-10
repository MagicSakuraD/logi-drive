import React from "react";

interface GearShiftProps {
  gear: string;
}

const GearShift: React.FC<GearShiftProps> = ({ gear }) => {
  return (
    <div>
      <div className="text-sm text-muted-foreground">挡位</div>
      <div className="text-xl font-bold tabular-nums leading-none">{gear}</div>
    </div>
  );
};

export default GearShift;
