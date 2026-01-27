import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import updateScore from "@/apis/user/updateScore";
import { QuizStatus } from "@/app/quiz/page";
import { QUIZ_STATUS } from "@/constant/quiz";
import SCORE from "@/constant/score";
import { HAS_SEEN_EXPLANATION } from "@/constant/storageName";

import BubbleChat from "../common/BubbleChat";
import ButtonModal from "../common/ButtonModal";
import EmSpan from "../common/EmSpan";

interface Props {
  status: QuizStatus;
  setStatus: (status: QuizStatus) => void;
  explanation?: string;
}

const Result = ({ status, setStatus, explanation }: Props) => {
  const router = useRouter();
  // React Query 캐시 무효화를 위한 queryClient
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [hasSeenExplanation, setHasSeenExplanation] = useState(false);

  useEffect(() => {
    setHasSeenExplanation(
      localStorage.getItem(HAS_SEEN_EXPLANATION) ==
        dayjs().format("YYYY-MM-DD"),
    );
  }, []);

  const onClickExplanation = async () => {
    setShowModal(true);
    const res = localStorage.getItem(HAS_SEEN_EXPLANATION);

    if (res == dayjs().format("YYYY-MM-DD")) {
      return;
    } else {
      localStorage.setItem(HAS_SEEN_EXPLANATION, dayjs().format("YYYY-MM-DD"));
      setHasSeenExplanation(true);

      await updateScore(SCORE.HAS_SEEN_EXPLANATION, "해설 확인");
      // mutation 후 관련 캐시 무효화하여 최신 데이터 반영
      // profile: 사용자 점수 갱신
      // reward: 보상 내역 갱신
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["reward"] });
      setShowModal(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full relative w-full">
      <ButtonModal
        buttonText="점수 내역 확인하기"
        contents={[explanation ?? "해설이 없습니다."]}
        isOpen={showModal}
        onClickButton={() => {
          router.replace("/reward");
        }}
        title="‘퀴즈 해설 확인’ 완료"
      />

      <div className="flex flex-col items-center justify-center py-10 mt-3 border-[1.5px] border-gray-lightest bg-white w-full ">
        <div
          className={`text-[160px] font-medium w-[200px] h-[200px] border-[1.5px] rounded-2xl flex items-center justify-center border-black ${status === QUIZ_STATUS.CORRECT ? "text-primary" : "text-error"} bg-yellow pb-[8px]`}
          style={{
            lineHeight: "200px",
          }}
        >
          {status === QUIZ_STATUS.CORRECT ? "O" : "X"}
        </div>
        <p className="mt-6 text-2xl font-bold">
          <span
            className={`emphasis text-${status === QUIZ_STATUS.CORRECT ? "primary" : "error"}`}
          >
            {status === QUIZ_STATUS.CORRECT ? "정답" : "오답"}
          </span>{" "}
          입니다!
        </p>
        <p className="mt-1 text-2xl">
          {status === QUIZ_STATUS.CORRECT ? (
            <span>
              안전 퀴즈 <EmSpan>{SCORE.QUIZ_CORRECT}</EmSpan>점 적립 완료
            </span>
          ) : (
            "내일 다시 도전해주세요!"
          )}
        </p>
        <div className="flex flex-col items-center justify-center relative mt-10 mb-2">
          {!hasSeenExplanation && (
            <div className="absolute top-[-28px] left-[-16px]">
              <BubbleChat
                isPrimary={true}
                text={`+${SCORE.HAS_SEEN_EXPLANATION}점`}
              />
            </div>
          )}
          <button
            className="p-2 px-6 bg-black text-white rounded-full my-4 cursor-pointer"
            onClick={onClickExplanation}
          >
            해설 확인
          </button>
        </div>
        <div className="text-center px-4 text-xs flex flex-col gap-1">
          <div>
            <EmSpan>[해설 확인]</EmSpan> 추가 점수는 문제당 1회 지급됩니다.
          </div>
          <div>(버튼을 누른 최초 1회만 점수 인정)</div>
        </div>
      </div>

      {/* <div className="flex items-center mt-8 gap-4 flex-row">
          <Button onClick={() => router.push("/")}>홈으로 돌아가기</Button>
          <Button onClick={onClickCommentary}>해설 보러가기 (+5점)</Button>
        </div> */}
    </div>
  );
};

export default Result;
