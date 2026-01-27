"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import TabList from "@/components/common/TabList";
import CourseList from "@/components/course/CourseList";
import CourseCreate from "@/components/course/CourseCreate";
import { ICourseCard } from "@/types/course";

export default function Home() {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(1);

  // 성능 최적화: useQuery 대신 invalidateQueries 사용
  // 이유: 이 페이지에서는 courseList 데이터를 직접 사용하지 않음
  // useQuery를 사용하면 매 렌더링마다 불필요한 API 요청 발생
  // create 후 코스 목록 탭으로 이동할 때만 데이터 갱신하면 됨
  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["courseList"] });

  return (
    <div>
      <div className="flex">
        <TabList active={value == 1} isRed onClick={() => setValue(1)}>
          추천하기
        </TabList>
        <TabList
          active={value == 2}
          isRed
          onClick={() => {
            setValue(2);
          }}
        >
          추천 내역 보기
        </TabList>
      </div>
      <div className="bg-white p-4 default-border">
        {value == 1 ? (
          <CourseCreate
            goToList={() => {
              refetch();
              setValue(2);
            }}
          />
        ) : (
          <Suspense>
            <CourseList />
          </Suspense>
        )}
      </div>
    </div>
  );
}
