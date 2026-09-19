import React, { useMemo } from 'react';
import { getHistoryData } from '../api/weatherApi';
import { clamp } from '../lib/scoring';
import type { LocationItem } from '../types';

interface HistoryPageProps {
  currentLocation: LocationItem;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ currentLocation }) => {
  const history = useMemo(() => getHistoryData(currentLocation), [currentLocation]);

  // Tìm maxRain của cả 2 series để tính tỉ lệ cột
  const maxMm = useMemo(() => {
    let max = 100;
    history.monthly.forEach(m => {
      if (m.recentRain > max) max = m.recentRain;
      if (m.historicalAvg > max) max = m.historicalAvg;
    });
    return max;
  }, [history]);

  const diffSign = history.percentDiff >= 0 ? `+${history.percentDiff}%` : `${history.percentDiff}%`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-[16px] mt-[20px]">
      {/* Cột trái: Thẻ biểu đồ lượng mưa */}
      <div className="bg-card rounded-[24px] p-[28px_30px] shadow-sh2 flex flex-col justify-between">
        <div>
          <h2 className="font-nunito font-bold text-[20px] text-ink">
            Lượng mưa 12 tháng qua · {currentLocation.name}
          </h2>

          {/* 12 nhóm cột đôi */}
          <div className="overflow-x-auto pb-2 mt-[26px]">
            <div className="flex items-end justify-between gap-[9px] h-[210px] min-w-[560px]">
              {history.monthly.map(m => {
                // Công thức tính từ spec SCORING.md:
                // clamp(mm / (maxMm * 1.35) * 150, 3, 150) * 1.1
                const hRecent = clamp((m.recentRain / (maxMm * 1.35)) * 150, 3, 150) * 1.1;
                const hHistorical = clamp((m.historicalAvg / (maxMm * 1.35)) * 150, 3, 150) * 1.1;

                return (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center justify-end h-full gap-[8px] group"
                  >
                    <div className="flex items-end gap-[3px] w-full justify-center h-[165px]">
                      {/* Cột Trung bình nhiều năm (dim) */}
                      <div
                        style={{ height: `${hHistorical}px` }}
                        className="w-[12px] bg-dim rounded-t-[5px] transition-all duration-200"
                        title={`Trung bình ${m.monthLabel}: ${m.historicalAvg} mm`}
                      />
                      {/* Cột 12 tháng qua (acc) */}
                      <div
                        style={{ height: `${hRecent}px` }}
                        className="w-[12px] bg-acc rounded-t-[5px] transition-all duration-200"
                        title={`12 tháng qua ${m.monthLabel}: ${m.recentRain} mm`}
                      />
                    </div>

                    <span className="text-[10.5px] text-m3 font-nunito leading-none">
                      {m.monthLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chú giải */}
        <div className="flex items-center gap-[20px] text-[12.5px] text-m1 mt-[18px] pt-[14px] border-t border-border">
          <div className="flex items-center gap-[7px]">
            <span className="w-[10px] h-[10px] rounded-[3px] bg-acc inline-block" />
            <span>12 tháng qua</span>
          </div>
          <div className="flex items-center gap-[7px]">
            <span className="w-[10px] h-[10px] rounded-[3px] bg-dim inline-block" />
            <span>Trung bình nhiều năm</span>
          </div>
        </div>
      </div>

      {/* Cột phải: Ba thẻ insight */}
      <div className="flex flex-col gap-[12px]">
        {/* Insight 1: Tổng lượng mưa so sánh */}
        <div className="bg-card rounded-[20px] p-[22px_24px] shadow-sh2 flex-1 flex flex-col justify-center">
          <span className="font-nunito font-bold text-[30px] text-acc tracking-[-0.02em] leading-tight">
            {diffSign}
          </span>
          <p className="text-[14px] text-ink2 leading-[1.55] mt-[6px] pretty-text">
            Tổng lượng mưa 12 tháng qua so với trung bình nhiều năm tại {currentLocation.name}.
          </p>
        </div>

        {/* Insight 2: Tháng mưa nhiều nhất */}
        <div className="bg-card rounded-[20px] p-[22px_24px] shadow-sh2 flex-1 flex flex-col justify-center">
          <span className="font-nunito font-bold text-[30px] text-acc tracking-[-0.02em] leading-tight">
            {history.wettestMonth.label}
          </span>
          <p className="text-[14px] text-ink2 leading-[1.55] mt-[6px] pretty-text">
            Tháng mưa nhiều nhất, khoảng {history.wettestMonth.rain} mm và {history.wettestMonth.days} ngày có mưa.
          </p>
        </div>

        {/* Insight 3: Nhiệt độ trung bình cao nhất/thấp nhất */}
        <div className="bg-card rounded-[20px] p-[22px_24px] shadow-sh2 flex-1 flex flex-col justify-center">
          <span className="font-nunito font-bold text-[30px] text-acc tracking-[-0.02em] leading-tight">
            {history.highestTempMonth.maxTemp}°C
          </span>
          <p className="text-[14px] text-ink2 leading-[1.55] mt-[6px] pretty-text">
            Nhiệt độ trung bình tháng cao nhất trong năm; thấp nhất là {history.highestTempMonth.minTemp}°C.
          </p>
        </div>
      </div>
    </div>
  );
};
