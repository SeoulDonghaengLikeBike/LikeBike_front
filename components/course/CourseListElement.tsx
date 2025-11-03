import { LOG_STATUS } from "@/types/bikeLog";
import dayjs from "dayjs";
import { useState } from "react";
import PhotoStatusCard from "../bikelog/PhotoStatusCard";
import ToggleContent from "../common/ToggleContent";
import CourseViewer from "./CourseViewer";
import { ICourseResponse } from "@/apis/course/getCourse";
import { useRouter } from "next/navigation";

export default function CourseListElement({
  v,
  idx,
}: {
  v: ICourseResponse;
  idx: number;
}) {
  const { id, created_at, status, places, photo_url, admin_notes } = v;
  const router = useRouter();

  return (
    <ToggleContent
      key={id}
      defaultValue={idx === 0}
      title={`[${LOG_STATUS[status as keyof typeof LOG_STATUS]?.text ?? ""}] ${dayjs(created_at?.replace("GMT", "")).format("YYYY-MM-DD, A hh시 mm분")}`}
    >
      <div className="flex flex-row gap-4 pt-2 cursor-pointer">
        <div
          className="w-full rounded-lg overflow-hidden active:opacity-70"
          onClick={() => router.push(`?viewModal=${v.id}`)}
        >
          <PhotoStatusCard
            chipText={places.map((place) => place.name).join(" → ")}
            imgUrl={photo_url}
            status={status as keyof typeof LOG_STATUS}
            text={
              status === "pending"
                ? "올바르게 인증했다면, 자동으로 코스추천 점수 10점이 적립돼요!"
                : status === "verified"
                  ? "코스추천 점수 10점 적립완료"
                  : admin_notes || ""
            }
          />
        </div>
      </div>
    </ToggleContent>
  );
}
