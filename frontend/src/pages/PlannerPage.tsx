import React from 'react';
import type { ProcessedWeatherData } from '../api/weatherApi';
import { getScoreColor } from '../lib/scoring';

interface PlannerPageProps {
  data: ProcessedWeatherData;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 min-[900px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-[16px] mt-[20px]">
      {/* Cột trái: Biểu đồ chi tiết 24 giờ */}
      <div className="bg-card rounded-[24px] p-[28px_30px] shadow-sh2 flex flex-col justify-between">
        <div>
          <h2 className="font-nunito font-bold text-[21px] text-ink">
            Hôm nay nên ra ngoài lúc nào?
          </h2>
          <p className="text-[14px] text-m1 leading-[1.6] max-w-[420px] mt-[6px]">
            Thanh càng cao thì giờ đó càng dễ chịu. Nhiệt độ, mưa, gió và UV được chấm chung một thang 0 – 100.
          </p>

          {/* 24 Cột lớn 170px */}
          <div className="overflow-x-auto pb-2 mt-[26px]">
            <div className="flex items-end gap-[4px] h-[170px] min-w-[560px]">
              {data.hourly.map(h => {
                const isDivBy3 = h.hour % 3 === 0;
                const barHeight = 10 + h.score * 1.2;
                const barColor = getScoreColor(h.hour, h.score);

                return (
                  <div
                    key={h.hour}
                    className="flex-1 flex flex-col items-center justify-end h-full gap-[7px] group relative"
                  >
                    {/* Score label (chỉ hiện khi giờ chia hết cho 3) */}
                    <span
                      className={`text-[9.5px] text-m3 font-nunito leading-none select-none ${
                        isDivBy3 ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {h.score}
                    </span>

                    {/* Tooltip on hover */}
                    <div className="absolute -top-6 hidden group-hover:flex bg-ink text-card text-[11px] py-0.5 px-1.5 rounded whitespace-nowrap z-20 pointer-events-none">
                      {String(h.hour).padStart(2, '0')}:00 · {h.score}đ · {h.temp}°C
                    </div>

                    {/* Bar */}
                    <div
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: barColor,
                      }}
                      className="w-full rounded-[6px] transition-all duration-200"
                    />

                    {/* Hour label (chỉ hiện khi chia hết cho 3) */}
                    <span
                      className={`text-[9.5px] text-m3 font-nunito leading-none select-none ${
                        isDivBy3 ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {String(h.hour).padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chú giải */}
        <div className="flex items-center gap-[16px] text-[11.5px] text-m1 mt-[20px] pt-[14px] border-t border-border flex-wrap">
          <div className="flex items-center gap-[6px]">
            <span className="w-[9px] h-[9px] rounded-[3px] bg-acc inline-block" />
            <span>Rất tốt (≥70)</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="w-[9px] h-[9px] rounded-[3px] bg-mid inline-block" />
            <span>Tạm được (50–69)</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="w-[9px] h-[9px] rounded-[3px] bg-dim inline-block" />
            <span>Nên ở trong nhà (&lt;50)</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="w-[9px] h-[9px] rounded-[3px] bg-night inline-block" />
            <span>Ban đêm</span>
          </div>
        </div>
      </div>

      {/* Cột phải: 4 Hoạt động */}
      <div className="flex flex-col gap-[12px]">
        {data.activities.map(act => (
          <div
            key={act.id}
            className="bg-card rounded-[20px] p-[20px_22px] shadow-sh2 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-baseline">
                <h3 className="text-[16px] font-semibold text-ink">{act.name}</h3>
                <span className="font-nunito text-[12.5px] text-acc font-semibold">
                  {act.score} đ
                </span>
              </div>

              <div className="font-nunito font-normal text-[24px] text-ink tracking-[-0.01em] mt-[8px]">
                {act.range}
              </div>

              <p className="text-[12.5px] text-m2 mt-[4px]">{act.note}</p>
            </div>

            <div className="h-[6px] rounded-[3px] bg-track overflow-hidden w-full mt-[14px]">
              <div
                style={{ width: `${act.score}%` }}
                className="h-full bg-acc rounded-[3px] transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
