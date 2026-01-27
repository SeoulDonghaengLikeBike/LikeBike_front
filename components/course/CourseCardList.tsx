"use client";

import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createCourse } from "@/apis/course/createCourse";
import { ICourseCard, IKakaoMapPoint } from "@/types/course";
import CourseCard from "./CourseCard";
import ReactModal from "react-modal";
import { useRouter, useSearchParams } from "next/navigation";
import CourseSearch from "./CourseSearch";
import { IError } from "@/types/base";
import { AxiosError } from "axios";

interface Props {
  courseCount: number | undefined;
  setErrorModalIsOpen: (value: boolean) => void;
  setModalIsOpen: (value: boolean) => void;
  placeInfo: (IKakaoMapPoint | null)[];
  setPlaceInfo: Dispatch<SetStateAction<(IKakaoMapPoint | null)[]>>;
}

export default function CourseCardList({
  courseCount,
  setErrorModalIsOpen,
  setModalIsOpen,
  placeInfo,
  setPlaceInfo,
}: Props) {
  // React Query 캐시 무효화를 위한 queryClient
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const modalIdx = params.has("modal") ? Number(params.get("modal")) : null;

  const isAlreadyCertified = courseCount && courseCount >= 2;

  const [courseInfo, setCourseInfo] = useState<ICourseCard[]>([
    { place: null, text: "", image: null },
    { place: null, text: "", image: null },
  ]);

  // 성능 최적화: useCallback으로 메모이제이션
  // 이유: onSubmit 함수 내부에서만 사용되며, 외부에서 참조하지 않음
  // 하지만 안전하게 메모이제이션하여 불필요한 함수 생성 방지
  const checkCompletedCourses = useCallback((res: ICourseCard[]) => {
    for (let i = 0; i < res.length; i++) {
      const course = res[i];
      if (!course.place || !course.text.trim()) return false;
      if ((i === 0 || i === res.length - 1) && !course.image) return false;
    }
    return true;
  }, []);

  // 성능 최적화: useCallback으로 메모이제이션
  // 이유: 이 함수를 제출 버튼의 onClick prop으로 전달
  // 함수가 매 렌더링마다 새로 생성되면 불필요한 리렌더링 유발
  const onSubmit = useCallback(async () => {
    const res = courseInfo.map((v, idx) => ({ ...v, place: placeInfo[idx] }));
    if (!checkCompletedCourses(res)) {
      setShowError(true);
      setErrorModalIsOpen(true);
      return;
    }

    try {
      setLoading(true);
      await createCourse(res);
      // mutation 후 관련 캐시 무효화하여 최신 데이터 반영
      // courseList: 코스 목록 갱신
      // courseCount: 코스 추천 가능 횟수 (주 2회 제한) 갱신
      queryClient.invalidateQueries({ queryKey: ["courseList"] });
      queryClient.invalidateQueries({ queryKey: ["courseCount"] });
      setModalIsOpen(true);
    } catch (e) {
      console.error("Error creating course:", e);
      const error = e as AxiosError<IError>;
      alert(
        "인증에 실패했습니다. 다시 시도해주세요. [" +
          (error?.response?.data.data?.[0].error || "알 수 없는 오류") +
          "]",
      );
    } finally {
      setLoading(false);
    }
  }, [
    // 의존성 배열: useCallback이 이 값들이 변경될 때만 새로운 함수를 생성
    courseInfo, // 상태 값이 변경될 때만 새로운 함수 생성
    placeInfo, // 상태 값이 변경될 때만 새로운 함수 생성
    setShowError, // setState 함수는 항상 같은 참조이지만 안전하게 명시
    setErrorModalIsOpen, // setState 함수는 항상 같은 참조이지만 안전하게 명시
    setModalIsOpen, // setState 함수는 항상 같은 참조이지만 안전하게 명시
  ]);

  // 성능 최적화: useCallback으로 메모이제이션
  // 이유: 이 함수를 자식 컴포넌트(CourseCard)의 removeCourse prop으로 전달
  // 함수가 매 렌더링마다 새로 생성되면 자식 컴포넌트가 불필요하게 리렌더링됨
  const removeCourse = useCallback((selectedId: number) => {
    setCourseInfo((prev) => prev.filter((_, idx) => idx !== selectedId));
    setPlaceInfo((prev) => prev.filter((_, idx) => idx !== selectedId));
  }, []);

  // 성능 최적화: useCallback으로 메모이제이션
  // 이유: 이 함수를 자식 컴포넌트(CourseCard)의 setInfo prop으로 전달
  // 함수가 매 렌더링마다 새로 생성되면 자식 컴포넌트가 불필요하게 리렌더링됨
  const updateInfo = useCallback((newInfo: ICourseCard, index: number) => {
    setCourseInfo((prev) => {
      const updated = [...prev];
      updated[index] = newInfo;
      return updated;
    });
  }, []);

  // 성능 최적화: useCallback으로 메모이제이션
  // 이유: 이 함수를 CourseSearch 모달의 onSelect prop으로 전달
  // 함수가 매 렌더링마다 새로 생성되면 자식 컴포넌트가 불필요하게 리렌더링됨
  // 장소 업데이트 (modalIdx 기준)
  const updatePlaceInfo = useCallback(
    (newPlace: IKakaoMapPoint | null) => {
      if (modalIdx == null) return;
      setPlaceInfo((prev) => {
        const updated = [...prev];
        updated[modalIdx] = newPlace;
        return updated;
      });
    },
    // 의존성 배열: modalIdx가 변경될 때만 새로운 함수 생성
    [modalIdx, setPlaceInfo],
  );

  // 성능 최적화: useCallback으로 메모이제이션
  // 이유: 이 함수를 자식 컴포넌트(CourseCard)의 addNextCourse prop으로 전달
  // 함수가 매 렌더링마다 새로 생성되면 자식 컴포넌트가 불필요하게 리렌더링됨
  // 코스 추가
  const addNextCourse = useCallback(() => {
    setCourseInfo((prev) => {
      if (prev.length >= 4) return prev;
      const updated = [...prev];
      updated.splice(-1, 0, {
        place: null,
        text: "",
        image: null,
        preview: null,
      });
      return updated;
    });

    setPlaceInfo((prev) => {
      if (prev.length >= 4) return prev;
      const updated = [...prev];
      updated.splice(-1, 0, null);
      return updated;
    });
  }, []);

  return (
    <>
      {/* 모달: 부모에서 단일 렌더 */}
      <ReactModal
        isOpen={modalIdx !== null}
        ariaHideApp={false}
        className="max-w-[460px] mx-auto p-6 bg-white rounded-lg shadow-lg outline-none h-[100vh]"
        style={{ overlay: { zIndex: 2000 }, content: { zIndex: 2100 } }}
      >
        {modalIdx !== null && (
          <CourseSearch
            onClose={() => router.back()}
            defaultPlace={placeInfo[modalIdx]}
            onSelect={(newPlace: IKakaoMapPoint) => {
              updatePlaceInfo(newPlace);
              router.back();
            }}
          />
        )}
      </ReactModal>

      {/* 코스 카드 리스트 */}
      {courseInfo.map((v, idx) => {
        const position =
          idx === 0
            ? "start"
            : idx === courseInfo.length - 1
              ? "end"
              : "stopover";

        return (
          <CourseCard
            key={idx}
            idx={idx}
            position={position}
            info={{
              place: placeInfo[idx],
              text: v.text,
              image: v.image,
              preview: v.preview,
            }}
            setInfo={(newInfo) => updateInfo(newInfo, idx)}
            removeCourse={() => removeCourse(idx)}
            addNextCourse={addNextCourse}
            courseLength={courseInfo.length}
            showError={showError}
          />
        );
      })}

      {/* 제출 버튼 */}
      <button
        className={`${
          isAlreadyCertified
            ? "bg-gray-lightest text-gray-medium"
            : "bg-contrast-dark text-white cursor-pointer"
        } p-4 rounded-xl text-center text-lg font-bold mt-4`}
        disabled={!!isAlreadyCertified || loading}
        onClick={() => {
          if (!loading) onSubmit();
        }}
      >
        {isAlreadyCertified
          ? "코스 추천 주 2회 제출 완료"
          : "코스 추천 제출하기"}
      </button>
    </>
  );
}
