declare global {
  interface Window {
    kakao?: {
      maps?: {
        load?: (callback: () => void) => void;
      };
    };
  }
}

import { useEffect, useState } from "react";

const SCRIPT_ID = "kakao-map-sdk";
const SRC = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false&libraries=services`;

export default function useKakao() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // already ready
    if ((window as any).kakao?.maps) {
      setLoaded(true);
      return;
    }

    const callMapsLoad = () => {
      try {
        if (window.kakao?.maps?.load) {
          window.kakao.maps.load(() => setLoaded(true));
        } else if (window.kakao && !window.kakao.maps) {
          // kakao exists but maps not ready, try small poll then call load
          const t = setInterval(() => {
            if (window.kakao?.maps?.load) {
              clearInterval(t);
              window.kakao.maps.load(() => setLoaded(true));
            }
          }, 50);
          // Clear interval after 5 seconds to prevent infinite polling
          const timeout = setTimeout(() => clearInterval(t), 5000);
          return () => {
            clearInterval(t);
            clearTimeout(timeout);
          };
        }
      } catch (e: any) {
        setError(e);
      }
    };

    const existing = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;
    if (existing) {
      // script tag exists; wait for kakao to be ready or attach load
      if (window.kakao?.maps) {
        setLoaded(true);
      } else {
        const loadHandler = () => callMapsLoad();
        const errorHandler = () =>
          setError(new Error("Failed to load Kakao SDK"));

        existing.addEventListener("load", loadHandler);
        existing.addEventListener("error", errorHandler);

        return () => {
          existing.removeEventListener("load", loadHandler);
          existing.removeEventListener("error", errorHandler);
        };
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SRC;
    script.async = true;

    const loadHandler = () => callMapsLoad();
    const errorHandler = () => setError(new Error("Failed to load Kakao SDK"));

    script.addEventListener("load", loadHandler);
    script.addEventListener("error", errorHandler);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", loadHandler);
      script.removeEventListener("error", errorHandler);
      // Optionally remove the script on unmount if you want
      // document.head.removeChild(script);
    };
  }, []);

  return { loaded, error };
}
