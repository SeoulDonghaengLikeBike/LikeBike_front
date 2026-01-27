import dayjs from "dayjs";
import React from "react";

import { IBikeLog, LOG_STATUS, UserBikeLog } from "@/types/bikeLog";

import ToggleContent from "../common/ToggleContent";
import PhotoStatusCard from "./PhotoStatusCard";

require("dayjs/locale/ko");
dayjs.locale("ko");

const BikeLog = ({
  bike_photo_url,
  safety_gear_photo_url,
  verification_status,
  started_at,
  admin_notes,
  defaultOpen,
}: IBikeLog & {
  defaultOpen?: boolean;
}) => {
  const text =
    verification_status === "pending"
      ? "올바르게 인증했다면, 자동으로 자전거 타기 점수 30점이 적립돼요!"
      : verification_status === "verified"
        ? "자전거 타기 점수 30점 적립완료"
        : admin_notes || "";

  return (
    <ToggleContent
      defaultValue={defaultOpen}
      title={`[${LOG_STATUS[verification_status].text}] ${dayjs(started_at?.replace("GMT", "")).format("YYYY-MM-DD, A hh시 mm분")}`}
    >
      <div className="flex flex-row gap-4 px-8 pt-2">
        <PhotoStatusCard
          chipText="안전모+사용자"
          imgUrl={safety_gear_photo_url}
          status={verification_status}
          text={text}
        />
        <PhotoStatusCard
          chipText="자전거"
          imgUrl={bike_photo_url}
          status={verification_status}
          text={text}
        />
      </div>
    </ToggleContent>
  );
};

// 성능 최적화: React.memo로 래핑
// 이유: 부모 컴포넌트(BikeLogList)가 리렌더링될 때 불필요하게 각 BikeLog가 리렌더링되는 것을 방지
// props가 변경되지 않으면 이전 렌더링 결과를 재사용하여 성능 향상
export default React.memo(BikeLog);
