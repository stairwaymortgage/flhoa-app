"use client";

import { useInquiry } from "./InquiryModal";

interface HeroCtaProps {
  /** Flow key — e.g. "finance", "sell", "foreign-national", "preconstruction", "board", "check-building" */
  intent: string;
  /** Button label, set per page */
  label: string;
  /** Fine print below the button */
  fine: string;
}

export function HeroCta({ intent, label, fine }: HeroCtaProps) {
  const { openInquiry } = useInquiry();

  return (
    <div>
      <button
        type="button"
        onClick={() => openInquiry(intent)}
        className={[
          "bg-gold text-navy-dark font-bold text-[17px] py-[18px] px-9 rounded-[5px]",
          "inline-flex items-center gap-2.5",
          "transition-all duration-150",
          "hover:bg-[#D9B23A] hover:-translate-y-0.5 hover:shadow-lg",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2",
        ].join(" ")}
      >
        {label}
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 10h12M11 5l5 5-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <p className="mt-3 text-[12px] text-[#8EA8BF] leading-snug">{fine}</p>
    </div>
  );
}
