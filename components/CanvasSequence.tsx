"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type CanvasSequenceHandle = {
  /** Maps a 0–1 scroll progress value to the nearest loaded frame and paints it. */
  setProgress: (progress: number) => void;
};

type FrameCounts = { desktop: number; mobile: number };

type CanvasSequenceProps = {
  /** Folder name under /public/sequences/<sequence>/desktop|mobile/ */
  sequence: string;
  frameCount: FrameCounts;
  className?: string;
  /** Fired once the very first frame has decoded and been painted. */
  onFirstFrameReady?: () => void;
};

const MOBILE_QUERY = "(max-width: 767px)";
const NEARBY_RADIUS = 8;
const BATCH_SIZE = 6;

function pad4(n: number) {
  return String(n).padStart(4, "0");
}

function framePath(sequence: string, device: "desktop" | "mobile", index: number) {
  return `/sequences/${sequence}/${device}/frame_${pad4(index)}.webp`;
}

/** Computes an `object-fit: cover` style source rectangle. */
function coverSourceRect(
  imgW: number,
  imgH: number,
  canvasW: number,
  canvasH: number
) {
  const imgRatio = imgW / imgH;
  const canvasRatio = canvasW / canvasH;
  let sw = imgW;
  let sh = imgH;

  if (imgRatio > canvasRatio) {
    sw = imgH * canvasRatio;
  } else {
    sh = imgW / canvasRatio;
  }

  return {
    sx: (imgW - sw) / 2,
    sy: (imgH - sh) / 2,
    sw,
    sh,
  };
}

const CanvasSequence = forwardRef<CanvasSequenceHandle, CanvasSequenceProps>(
  function CanvasSequence(
    { sequence, frameCount, className, onFirstFrameReady },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

    const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
    const loadedRef = useRef<boolean[]>([]);
    const failedRef = useRef<boolean[]>([]);
    const currentIndexRef = useRef(1);
    const lastDrawnIndexRef = useRef(0);
    const deviceRef = useRef<"desktop" | "mobile">("desktop");
    const generationRef = useRef(0);
    const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
    const dprRef = useRef(1);

    const draw = (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || canvas.width === 0 || canvas.height === 0) return;

      const loaded = loadedRef.current;
      const images = imagesRef.current;

      let target = index;
      if (!loaded[target]) {
        // Frame not loaded yet — hold the nearest already-loaded frame so the
        // canvas never goes blank while the sequence streams in.
        let found = -1;
        for (let d = 0; d <= NEARBY_RADIUS * 3; d++) {
          if (loaded[target - d]) {
            found = target - d;
            break;
          }
          if (loaded[target + d]) {
            found = target + d;
            break;
          }
        }
        if (found === -1) return;
        target = found;
      }

      if (target === lastDrawnIndexRef.current) return;

      const img = images[target];
      if (!img) return;

      const { sx, sy, sw, sh } = coverSourceRect(
        img.naturalWidth,
        img.naturalHeight,
        canvas.width,
        canvas.height
      );
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      lastDrawnIndexRef.current = target;
    };

    useImperativeHandle(ref, () => ({
      setProgress(progress: number) {
        const count = frameCount[deviceRef.current];
        const clamped = Math.min(1, Math.max(0, progress));
        const index = Math.min(count, Math.max(1, Math.round(clamped * (count - 1)) + 1));
        currentIndexRef.current = index;
        draw(index);
      },
    }));

    const resize = () => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      const rect = wrapper.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        lastDrawnIndexRef.current = 0;
        draw(currentIndexRef.current);
      }
    };

    useEffect(() => {
      const isMounted = { current: true };
      const generation = ++generationRef.current;
      deviceRef.current = device;

      const count = frameCount[deviceRef.current];
      imagesRef.current = new Array(count + 1).fill(null);
      loadedRef.current = new Array(count + 1).fill(false);
      failedRef.current = new Array(count + 1).fill(false);
      lastDrawnIndexRef.current = 0;

      const loadFrame = (index: number): Promise<void> => {
        if (index < 1 || index > count) return Promise.resolve();
        if (loadedRef.current[index] || failedRef.current[index]) return Promise.resolve();

        return new Promise((resolve) => {
          const img = new window.Image();
          img.decoding = "async";
          img.onload = () => {
            if (!isMounted.current || generationRef.current !== generation) return resolve();
            imagesRef.current[index] = img;
            loadedRef.current[index] = true;
            if (index === 1) onFirstFrameReady?.();
            if (index === currentIndexRef.current || lastDrawnIndexRef.current === 0) {
              draw(currentIndexRef.current);
            }
            resolve();
          };
          img.onerror = () => {
            failedRef.current[index] = true;
            resolve();
          };
          img.src = framePath(sequence, deviceRef.current, index);
        });
      };

      const scheduleBatches = (start: number) => {
        const remaining: number[] = [];
        for (let i = 1; i <= count; i++) {
          if (i < start - NEARBY_RADIUS || i > start + NEARBY_RADIUS) remaining.push(i);
        }
        // Interleave outward from the start point so nearby-but-not-adjacent
        // frames arrive before far ones.
        remaining.sort((a, b) => Math.abs(a - start) - Math.abs(b - start));

        let cursor = 0;
        const loadNextBatch = () => {
          if (!isMounted.current || generationRef.current !== generation) return;
          const batch = remaining.slice(cursor, cursor + BATCH_SIZE);
          cursor += BATCH_SIZE;
          Promise.all(batch.map(loadFrame)).then(() => {
            if (cursor < remaining.length) {
              const id = setTimeout(loadNextBatch, 0);
              timersRef.current.push(id);
            }
          });
        };
        loadNextBatch();
      };

      resize();

      (async () => {
        await loadFrame(1);
        resize();
        const nearby: number[] = [];
        for (let i = 1; i <= Math.min(count, 1 + NEARBY_RADIUS * 2); i++) nearby.push(i);
        await Promise.all(nearby.map(loadFrame));
        if (!isMounted.current || generationRef.current !== generation) return;
        scheduleBatches(1);
      })();

      const resizeObserver = new ResizeObserver(() => resize());
      if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

      return () => {
        isMounted.current = false;
        generationRef.current += 1;
        resizeObserver.disconnect();
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sequence, device]);

    useEffect(() => {
      const mobileQuery = window.matchMedia(MOBILE_QUERY);
      setDevice(mobileQuery.matches ? "mobile" : "desktop");
      const onChange = (event: MediaQueryListEvent) => {
        setDevice(event.matches ? "mobile" : "desktop");
      };
      mobileQuery.addEventListener("change", onChange);

      const onResize = () => resize();
      window.addEventListener("resize", onResize);
      return () => {
        mobileQuery.removeEventListener("change", onChange);
        window.removeEventListener("resize", onResize);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div ref={wrapperRef} className={className} aria-hidden="true">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    );
  }
);

export default CanvasSequence;
