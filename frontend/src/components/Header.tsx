import React from "react";
import { RotateCw } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export type PageTab = "tong-quan" | "khung-gio" | "so-sanh" | "lich-su";

interface HeaderProps {
  currentPage: PageTab;
  onSelectPage: (page: PageTab) => void;
  updatedAt: string;
  isFetching?: boolean;
  onRefresh?: () => void;
}

const TABS: { key: PageTab; label: string }[] = [
  { key: "tong-quan", label: "Tổng quan" },
  { key: "khung-gio", label: "Khung giờ tốt" },
  { key: "so-sanh", label: "So sánh" },
  { key: "lich-su", label: "Lịch sử" },
];

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSelectPage,
  updatedAt,
  isFetching,
  onRefresh,
}) => {
  return (
    <header className="flex items-center gap-[18px] flex-wrap justify-between">
      <div className="flex items-center gap-[14px] flex-wrap">
        {/* Pill Logo */}
        <BrandLogo />

        {/* Pill Tabs */}
        <nav className="bg-card rounded-full p-[5px] shadow-sh1 flex items-center gap-[3px]">
          {TABS.map((tab) => {
            const isActive = currentPage === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectPage(tab.key)}
                className={`px-[17px] py-[8px] !text-[13.5px] rounded-full transition-all duration-150 select-none cursor-pointer focus-ring ${
                  isActive
                    ? "bg-[#E1F0FA] text-[#0B6FA4] font-bold"
                    : "hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Date time & Refresh */}
      <div className="flex items-center gap-[10px] ml-auto">
        <span className="text-[12.5px] text-m2">{updatedAt}</span>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            title="Làm mới dữ liệu"
            className="p-[6px] rounded-full text-m1 hover:text-acc hover:bg-tint transition-colors focus-ring cursor-pointer"
          >
            <RotateCw
              className={`w-[14px] h-[14px] ${isFetching ? "animate-spin text-acc" : ""}`}
            />
          </button>
        )}
      </div>
    </header>
  );
};
