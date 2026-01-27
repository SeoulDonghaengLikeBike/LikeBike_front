import PhotoIcon from "@/public/icons/PhotoIcon";
import { ICourseCard, IKakaoMapPoint } from "@/types/course";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import CourseSearch from "./CourseSearch";
import ReactModal from "react-modal";
import { useDebouncedCallback } from "use-debounce";
import { useRouter } from "next/navigation";

interface ICourseCardProps {
  idx: number;
  info: {
    place: IKakaoMapPoint | null;
    text: string;
    image: File | null;
    preview?: string | null;
  };
  position?: "start" | "end" | "stopover";
  courseLength?: number;
  showError?: boolean;
  setInfo?: (course: ICourseCard) => void;
  setPlaceInfo?: Dispatch<SetStateAction<(IKakaoMapPoint | null)[]>>;
  removeCourse?: () => void;
  addNextCourse?: () => void;
  readOnly?: boolean;
}

const CourseCard = ({
  idx,
  info: { place, text, image, preview },
  position,
  courseLength,
  showError,
  setInfo,
  removeCourse,
  addNextCourse,
  readOnly = false,
}: ICourseCardProps) {
  const router = useRouter();

  const onChangeText = (s: string) => {
    setInfo?.({ text: s, image, preview, place });
  };
  const debouncedText = useDebouncedCallback((value) => {
    onChangeText(value);
  }, 500);

  // 성능 최적화: useMemo로 메모이제이션
  // 이유: errorInfo는 showError, place, text, image, position이 변경될 때만 재계산
  // 매 렌더링마다 새로운 객체가 생성되면 자식 컴포넌트가 불필요하게 리렌더링됨
  const errorInfo = useMemo(() => ({
    place: showError && !place,
    text: showError && (!text || text.trim() === ""),
    image: showError && (position === "start" || position === "end") && !image,
    hasError:
      showError &&
      (!place ||
        !text ||
        text.trim() === "" ||
      ((position === "start" || position === "end") && !image)),
  }), [showError, place, text, image, position]);

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfo?.({
          place,
          text,
          image: file,
          preview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-row align-center gap-2 bg-white relative">
      <div className="flex flex-col justify-center">
        <div className="bg-contrast w-[32px] h-[32px] rounded-full text-center leading-7 text-white font-bold absolute">
          {idx + 1}
        </div>
      </div>

      <div
        className={`flex flex-row gap-3 p-3 border-[1.5px] ${errorInfo.hasError ? "border-contrast-dark" : "border-gray-light"}   w-full ml-2 pl-5 rounded-lg`}
      >
        {preview ? (
          <label
            className="h-full xxs:w-[74px] xs:w-[96px] bg-gray-lightest rounded-xl flex items-center justify-center p-1 text-white cursor-pointer overflow-hidden relative"
            htmlFor={`image-${idx}`}
          >
            <Image
              src={preview}
              alt="Course Image"
              layout="fill"
              objectFit="cover"
              className={`rounded-xl`}
            />
          </label>
        ) : (
          <label
            htmlFor={`image-${idx}`}
            className={`h-full xxs:w-[74px] xs:w-[96px] bg-gray-lightest rounded-xl flex flex-col items-center justify-center p-1 text-white cursor-pointer ${errorInfo.image ? "border-1 border-contrast-dark" : ""}`}
          >
            <PhotoIcon color={"#969696"} />
          </label>
        )}
        <input
          type="file"
          id={`image-${idx}`}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (readOnly) return;
            onChangeFile(e);
          }}
          disabled={readOnly}
          maxLength={50}
        />
        <div className="flex flex-col flex-1 gap-1">
          <div
            className="flex flex-row justify-between cursor-pointer"
            onClick={() => {
              if (readOnly) return;
              router.push(`?modal=${idx}`);
            }}
          >
            <div className="flex flex-row gap-1">
              {place ? (
                <div className="leading-7 text-lg cursor-pointer">
                  {place.place_name}
                </div>
              ) : (
                <div className="leading-7 text-gray-medium text-lg ">
                  {position === "start"
                    ? "출발지 선택"
                    : position === "end"
                      ? "도착지 선택"
                      : "경유지 선택"}
                </div>
              )}

              <Image
                src={place ? "/icons/search_black.svg" : "/icons/search.svg"}
                alt="장소 검색"
                width={20}
                height={20}
                className="cursor-pointer"
              />
            </div>
            {!readOnly && position === "stopover" && (
              <div
                className="bg-contrast-dark px-2 rounded-full aspect-square text-center text-white leading-7 cursor-pointer w-[28px] h-[28px]"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCourse?.();
                }}
              >
                −
              </div>
            )}
            {!readOnly && position === "end" && (courseLength ?? 0) < 4 && (
              <div
                className="bg-contrast-dark px-2 rounded-full aspect-square text-center text-white leading-7 text-xl cursor-pointer w-[28px] h-[28px]"
                onClick={(e) => {
                  e.stopPropagation();
                  addNextCourse?.();
                }}
              >
                +
              </div>
            )}
          </div>
          <textarea
            readOnly={readOnly}
            defaultValue={text}
            className={`border-[1.5px] w-full resize-none ${errorInfo.text ? "border-contrast-dark" : "border-gray-light"} p-2 focus:border-contrast-dark`}
            placeholder="추천 이유를 작성해주세요"
            onChange={(e) => debouncedText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            maxLength={40}
          />
        </div>
      </div>
    </div>
  );
}


// 성능 최적화: React.memo로 래핑
// 이유: 부모 컴포넌트(CourseCardList)가 리렌더링될 때 불필요하게 각 CourseCard가 리렌더링되는 것을 방지
// props가 변경되지 않으면 이전 렌더링 결과를 재사용하여 성능 향상
export default React.memo(CourseCard);
