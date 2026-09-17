import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

interface ErrorMessageProps {
  locationName: string;
  onRetry: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ locationName, onRetry }) => {
  return (
    <div className="bg-card rounded-[24px] p-[32px] shadow-sh2 mt-[20px] text-center max-w-[540px] mx-auto border border-border">
      <div className="w-[48px] h-[48px] rounded-full bg-weak/40 text-acc flex items-center justify-center mx-auto mb-[16px]">
        <AlertCircle className="w-[24px] h-[24px]" />
      </div>

      <h3 className="font-nunito font-semibold text-[18px] text-ink mb-[6px]">
        Không tải được dữ liệu thời tiết
      </h3>

      <p className="text-[14px] text-m2 leading-[1.6] mb-[20px]">
        Không tải được dữ liệu thời tiết cho <strong>{locationName}</strong>. Vui lòng kiểm tra kết nối mạng và thử lại.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-[8px] bg-acc text-accInk px-[20px] py-[10px] rounded-full font-medium text-[13.5px] shadow-sh1 hover:opacity-95 transition-opacity cursor-pointer focus-ring"
      >
        <RotateCw className="w-[14px] h-[14px]" />
        Thử lại
      </button>
    </div>
  );
};
