import React from 'react';

export const WeatherSkeleton: React.FC = () => {
  return (
    <div className="space-y-[16px] mt-[20px] animate-pulse">
      {/* Row 1 */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-[16px]">
        {/* Left card */}
        <div className="bg-card rounded-[24px] p-[30px_32px_32px] shadow-sh2 h-[380px] flex flex-col justify-between">
          <div className="space-y-[12px]">
            <div className="h-[20px] bg-track rounded-md w-1/3" />
            <div className="h-[104px] bg-track rounded-xl w-1/2 mt-[8px]" />
            <div className="h-[22px] bg-track rounded-md w-3/4" />
            <div className="h-[18px] bg-track rounded-md w-1/2" />
          </div>

          {/* 4 metric boxes */}
          <div className="grid grid-cols-2 gap-[10px] mt-[26px]">
            <div className="bg-tint rounded-[16px] p-[14px_16px] h-[78px]" />
            <div className="bg-tint rounded-[16px] p-[14px_16px] h-[78px]" />
            <div className="bg-tint rounded-[16px] p-[14px_16px] h-[78px]" />
            <div className="bg-tint rounded-[16px] p-[14px_16px] h-[78px]" />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-[16px]">
          {/* Verdict card */}
          <div className="bg-acc/80 rounded-[24px] p-[28px_30px] shadow-sh2 h-[200px] flex flex-col justify-between">
            <div className="h-[16px] bg-white/20 rounded w-1/3" />
            <div className="h-[32px] bg-white/30 rounded w-4/5" />
            <div className="h-[18px] bg-white/20 rounded w-full" />
            <div className="h-[24px] bg-white/20 rounded w-1/2" />
          </div>

          {/* Hourly chart card */}
          <div className="bg-card rounded-[24px] p-[26px_28px_24px] shadow-sh2 h-[164px] flex flex-col justify-between">
            <div className="h-[18px] bg-track rounded w-1/4" />
            <div className="flex items-end gap-[4px] h-[70px]">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="flex-1 bg-track rounded-[4px] h-[40px]" />
              ))}
            </div>
            <div className="h-[12px] bg-track rounded w-full" />
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-[16px]">
        <div className="bg-card rounded-[24px] p-[26px_28px] shadow-sh2 h-[220px]" />
        <div className="bg-card rounded-[24px] p-[26px_28px] shadow-sh2 h-[220px]" />
      </div>
    </div>
  );
};
