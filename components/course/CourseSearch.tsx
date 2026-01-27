"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useKakao from "@/hooks/useKakao";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import { IKakaoMapPoint } from "@/types/course";

interface Props {
  defaultPlace: IKakaoMapPoint | null;
  onClose: () => void;
  onSelect: (place: any) => void;
}

export default function CourseSearch({
  defaultPlace,
  onClose,
  onSelect,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState(defaultPlace?.place_name || "");
  const [places, setPlaces] = useState<any[]>([]);
  const [currentPlace, setCurrentPlace] = useState<IKakaoMapPoint | null>(
    defaultPlace || null,
  );
  const [loading, setLoading] = useState(false);
  const { loaded, error } = useKakao();

  const initMap = useCallback(() => {
    const { kakao } = window;
    if (!mapRef.current) return;

    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.566826, 126.9786567),
      level: 3,
    });

    const ps = new kakao.maps.services.Places();
    const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

    let markers: any[] = [];

    // ✅ 마커 이미지 설정
    const normalImage = new kakao.maps.MarkerImage(
      "/icons/location_marker.svg",
      new kakao.maps.Size(18, 18),
    );

    const selectedImage = new kakao.maps.MarkerImage(
      "/icons/location_marker_selected.svg",
      new kakao.maps.Size(24, 35), // 살짝 확대 (애니메이션 효과 느낌)
    );

    const displayMarkers = (places: any[]) => {
      markers.forEach((m) => m.setMap(null));
      markers = [];

      const bounds = new kakao.maps.LatLngBounds();

      places.forEach((place) => {
        const lat = Number(place.y) || 0;
        const lng = Number(place.x) || 0;
        const position = new kakao.maps.LatLng(lat, lng);
        const marker = new kakao.maps.Marker({
          position,
          map,
          image: normalImage,
          zIndex: 1, // 기본 zIndex
        });

        kakao.maps.event.addListener(marker, "mouseover", () => {
          infowindow.setContent(
            `<div style="padding:5px;">${place.place_name}</div>`,
          );
          infowindow.open(map, marker);
        });

        kakao.maps.event.addListener(marker, "mouseout", () => {
          infowindow.close();
        });

        bounds.extend(position);
        markers.push(marker);
      });

      if (markers.length > 0) {
        map.setBounds(bounds);
      }
    };

    const searchPlaces = (keyword: string) => {
      if (!keyword.trim()) return;
      setLoading(true);
      ps.keywordSearch(keyword, (data: any[], status: any, pagination: any) => {
        setLoading(false);
        if (status === kakao.maps.services.Status.OK) {
          setPlaces(data);
          displayMarkers(data);
        } else {
          setPlaces([]);
        }
      });
    };

    window.__searchKakaoPlaces = searchPlaces;
    searchPlaces(keyword);
  }, [keyword]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (window.__searchKakaoPlaces) {
        window.__searchKakaoPlaces(keyword);
      }
    },
    [keyword],
  );

  // ✅ 선택 시 강조 + 위로 올라오게 (zIndex + 이미지 변경)
  const handlePlaceClick = (place: any) => {
    setCurrentPlace(place);

    const { kakao } = window;
    const map = window.__kakaoMapInstance as any;
    const infowindow = window.__kakaoInfoWindow as any;
    const markers = window.__kakaoMarkers as any[];
    const { normalImage, selectedImage } = window.__markerImages;

    if (!map || !markers) return;

    const selectedMarker = markers.find((m: any) => m.placeId === place.id);
    if (!selectedMarker) return;

    // 모든 마커 초기화
    markers.forEach((m) => {
      m.setImage(normalImage);
      m.setZIndex(1);
    });

    // 선택된 마커 강조 + 위로 올리기
    selectedMarker.setImage(selectedImage);
    selectedMarker.setZIndex(10);

    // 지도 중심 이동
    const pos = new kakao.maps.LatLng(place.y, place.x);
    map.panTo(pos);

    // 인포윈도우 표시
    infowindow.setContent(
      `<div style="padding:5px;">${place.place_name}</div>`,
    );
    infowindow.open(map, selectedMarker);
  };

  useEffect(() => {
    if (!loaded) return;
    if (error) return console.error(error);
    initMap();
  }, [loaded, error, initMap]);

  const onSubmitPlace = useCallback(() => {
    if (currentPlace) {
      onSelect(currentPlace);
    }
  }, [currentPlace, onSelect]);

  return (
    <div className="flex flex-col h-[100vh]">
      <div className="flex flex-row justify-end items-center mb-2">
        <button type="button" className="cursor-pointer" onClick={onClose}>
          <CloseIcon fontSize="large" />
        </button>
      </div>
      {/* 검색창 */}
      <form onSubmit={handleSearch} className="flex items-center mb-4 relative">
        <input
          maxLength={10}
          defaultValue={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="장소를 입력하세요"
          className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-contrast-dark"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // 폼 기본 submit 막기
              e.currentTarget.blur(); // 키패드 닫기
              handleSearch(e); // 직접 검색 실행
            }
          }}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
        >
          <Image src="/icons/search.svg" alt="search" width={24} height={24} />
        </button>
      </form>

      {/* 지도 */}
      <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200 mb-3">
        <div ref={mapRef} className="w-full h-[190px] z-30" />
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center py-4 text-gray-500 text-sm">
          🔍 검색 중...
        </div>
      )}

      {/* 결과 리스트 */}
      <div className="flex-1 border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-y-auto min-h-0 mb-8">
        {places.map((p) => (
          <div
            key={p.id}
            onClick={() => handlePlaceClick(p)}
            className={`p-4 cursor-pointer transition-colors ${
              currentPlace?.id === p.id
                ? "bg-contrast-light border-l-4 border-contrast-dark bg-contrast-light"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <LocationOnIcon
                fontSize={"large"}
                className="text-contrast-dark"
              />
              <div className="flex flex-col gap-0.5">
                <div className="text-gray-800">{p.place_name}</div>
                <div className="text-sm text-gray-medium">
                  {p.road_address_name || p.address_name}
                </div>
              </div>
            </div>
          </div>
        ))}
        {places.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-6">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 선택 버튼 */}
      <button
        className={`${
          !currentPlace
            ? "bg-gray-lightest text-gray-medium"
            : "bg-contrast-dark text-white cursor-pointer"
        } p-4 rounded-xl text-center text-lg font-bold mt-4 sticky bottom-4`}
        disabled={!currentPlace || loading}
        onClick={onSubmitPlace}
      >
        선택
      </button>
    </div>
  );
}
