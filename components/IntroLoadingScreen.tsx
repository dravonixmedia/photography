"use client";

type IntroLoadingScreenProps = {
  visible: boolean;
};

export default function IntroLoadingScreen({ visible }: IntroLoadingScreenProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-ink transition-opacity duration-700 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <span className="relative flex h-9 w-9 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full border border-paper/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-paper/80" />
        </span>
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-paper/50">
          Reyes Visual
        </span>
      </div>
    </div>
  );
}
