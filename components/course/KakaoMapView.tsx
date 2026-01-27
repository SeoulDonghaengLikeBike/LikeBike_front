import { IKakaoMapPoint } from "@/types/course";
import React, { useCallback, useEffect, useRef } from "react";
import useKakao from "@/hooks/useKakao";

export interface IKakaoMapPointViewProps {
  places: IKakaoMapPoint[];
}

function KakaoMapView({ places }: IKakaoMapPointViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { loaded, error } = useKakao();

  const createMap = useCallback(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps) return;

    kakao.maps.load(() => {
      const defaultPosition = new kakao.maps.LatLng(37.566826, 126.9786567);

      const map = new kakao.maps.Map(mapRef.current, {
        center: defaultPosition,
        level: 4,
      });

      // ✅ 여기서 인터랙션 비활성화
      map.setDraggable(false); // 드래그 금지
      map.setZoomable(false); // 마우스 휠 줌 금지
      map.setKeyboardShortcuts(false); // 키보드 이동 금지
      map.setZoomable(false); // 터치 확대 축소 금지
      map.setLevel(map.getLevel(), { animate: false }); // 확대 축소 애니메이션 제거

      if (places.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();

        places.forEach((place, i) => {
          const lat = Number(place.y) || 0;
          const lng = Number(place.x) || 0;
          const position = new kakao.maps.LatLng(lat, lng);

          new kakao.maps.CustomOverlay({
            position,
            content: `<div style="
            background:#FF7272; color:white; border-radius:50%;
            width:24px; height:24px;
            display:flex; justify-content:center; align-items:center;
            font-weight:bold;">${i + 1}</div>`,
            yAnchor: 0.5,
            map,
          });

          bounds.extend(position);
        });

        map.setBounds(bounds, 50, 50, 50, 50); // 여백 설정
        map.setLevel(map.getLevel(), { animate: false }); // ✅ 애니메이션 없이 반영

        // 경로 연결
        const linePath = places.map(
          (p) => new kakao.maps.LatLng(Number(p.y) || 0, Number(p.x) || 0),
        );
        new kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 3,
          strokeColor: "#FF7272",
          strokeOpacity: 0.8,
          strokeStyle: "solid",
          map,
        });
      }
    });
  }, [places, mapRef]);

  useEffect(() => {
    if (!loaded) return;
    if (error) return console.error(error);
    createMap();
    // re-create only when sdk loaded or places change
  }, [loaded, error, createMap]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl"
      style={{ position: "relative", zIndex: 0 }}
    />
  );
}

export default React.memo(KakaoMapView);
