"use client";

import { forwardRef } from "react";

type TechnicalFeatureProps = {
  label: string;
  description: string;
  index: number;
};

const POSITIONS = [
  "top-[16%] left-[8%] items-start text-left",
  "top-[14%] right-[8%] items-end text-right",
  "bottom-[22%] left-[9%] items-start text-left",
  "bottom-[20%] right-[9%] items-end text-right",
  "top-[42%] left-[6%] items-start text-left",
  "top-[40%] right-[6%] items-end text-right",
  "bottom-[38%] left-[10%] items-start text-left",
  "bottom-[36%] right-[10%] items-end text-right",
];

const TechnicalFeature = forwardRef<HTMLDivElement, TechnicalFeatureProps>(
  function TechnicalFeature({ label, description, index }, ref) {
    const position = POSITIONS[index % POSITIONS.length];

    return (
      <div
        ref={ref}
        className={`pointer-events-none absolute z-20 flex max-w-[15rem] flex-col gap-1.5 opacity-0 ${position}`}
      >
        <span className="flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-paper/90">
          <span className="h-px w-6 bg-paper/50" aria-hidden="true" />
          {label}
        </span>
        <span className="text-xs leading-relaxed text-paper/55">{description}</span>
      </div>
    );
  }
);

export default TechnicalFeature;
