import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { getProfile } from "@/apis/user/getProfile";
import { REWARD_LEVEL } from "@/constant/rewardLevel";
import CommonModal from "../common/CommonModal";
import Button from "../common/Button";
import GuideButton from "./GuideButton";

const RewardMain = () => {
  const router = useRouter();
  const { data } = useQuery({ queryKey: ["profile"], queryFn: getProfile });

  const points = data?.experience_points;

  const level = useMemo(() => {
    if (!points) return undefined;
    if (points < 100) return REWARD_LEVEL[0];
    if (points < 200) return REWARD_LEVEL[1];
    if (points < 300) return REWARD_LEVEL[2];
    if (points < 400) return REWARD_LEVEL[3];
    if (points < 500) return REWARD_LEVEL[4];
    return REWARD_LEVEL[5];
  }, [points]);

  return (
    <div>
      <GuideButton />
      <div className="card">
        {data ? (
          <div className="mb-4 font-medium">
            <span className="underline">{data?.username}</span> 님의 자전거
            레벨은 <span className="underline">{level?.name}</span>{" "}
            <span>
              (<span className="underline">{points}</span>
            </span>
            점)입니다.
          </div>
        ) : (
          <div className="mb-4 font-medium">
            <span className="underline">데이터 로딩에 실패했습니다.</span>
          </div>
        )}

        <div className="relative w-full h-[50px] bg-transparent border-2 border-black flex items-center z-10">
          <div className="absolute left-[20%] top-0 h-[48px] border-r border-black border-[1.5px] z-10"></div>
          <div className="absolute left-[40%] top-0 h-[48px] border-r border-black border-[1.5px] z-10"></div>
          <div className="absolute left-[60%] top-0 h-[48px] border-r border-black border-[1.5px] z-10"></div>
          <div className="absolute left-[80%] top-0 h-[48px] border-r border-black border-[1.5px] z-10"></div>
          <div
            className="h-[50px] border-2 border-black border-r-0 border-l-0"
            style={{
              width: `${((points ?? 0) / 500) * 100}%`,
              backgroundColor: `rgba(0,180,147,${level?.opacity ?? 0})`,
              // borderRight: "1.5px solid black",
            }}
          />
        </div>
        <div className="flex flex-row justify-between text-xs text-center w-full mt-1">
          {REWARD_LEVEL.map((item, index) => (
            <div key={index}>
              <div className="-mx-3">
                {item.name} <br />({item.point}점)
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-row gap-4 w-full mt-4 items-center justify-between">
          <button
            className=" h-full rounded-[32px] flex flex-row items-center justify-center gap-2 text-white bg-[#969696] text-xs px-4 py-2 cursor-pointer"
            onClick={() => {
              location.href = process.env.NEXT_PUBLIC_LEVEL_GUIDE_URL ?? "";
            }}
          >
            <img alt="notice" height={16} src="/icons/notice.svg" width={16} />
            <span className="text-center">레벨 안내</span>
          </button>
          <button
            className="h-full rounded-[32px] flex flex-row items-center justify-center gap-2 text-white bg-[#00B493] text-xs px-4 py-2 cursor-pointer"
            onClick={() => router.push("/reward")}
          >
            점수 내역
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardMain;
