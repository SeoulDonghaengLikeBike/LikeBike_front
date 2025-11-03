"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { attemptQuiz } from "@/apis/quiz/attemptQuiz";
import { getQuiz } from "@/apis/quiz/getQuiz";
import { getQuizStatus } from "@/apis/quiz/getQuizStaus";
import BubbleChat from "@/components/common/BubbleChat";
import EmSpan from "@/components/common/EmSpan";
import WhiteBox from "@/components/common/WhiteBox";
import Quiz from "@/components/quiz/Quiz";
import Result from "@/components/quiz/Result";
import { QUIZ_STATUS } from "@/constant/quiz";

export type QuizStatus = (typeof QUIZ_STATUS)[keyof typeof QUIZ_STATUS];

export default function Home() {
  const { data } = useQuery({ queryKey: ["quiz"], queryFn: getQuiz });

  const { data: quizStatus, isLoading } = useQuery({
    queryKey: ["quizStatus"],
    queryFn: getQuizStatus,
  });

  const [status, setStatus] = useState<QuizStatus | undefined>(undefined);
  const isCorrect = useRef<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (quizStatus?.attempted) {
      setStatus(
        quizStatus.is_correct ? QUIZ_STATUS.CORRECT : QUIZ_STATUS.WRONG
      );
      isCorrect.current = quizStatus.is_correct;
    } else {
      setStatus(QUIZ_STATUS.QUIZ);
      isCorrect.current = null;
    }
  }, [quizStatus]);

  const handleClick = async (selectedValue: string) => {
    if (selectedValue == "") {
      alert("답변을 선택해주세요.");
      return;
    }

    if (data?.id) {
      const res = await attemptQuiz(String(data.id), selectedValue);
      if (res?.is_correct === true) {
        setStatus(QUIZ_STATUS.CORRECT);
        isCorrect.current = true;
      } else {
        setStatus(QUIZ_STATUS.WRONG);
        isCorrect.current = false;
      }
    }
  };

  return (
    <div className="h-full flex flex-col flex-1">
      <div className="pb-4">
        <BubbleChat text="이렇게 퀴즈를 풀어주세요!" />
      </div>
      <WhiteBox>
        <div>① 하루 1번, 퀴즈 풀기</div>
        <div>
          ② <EmSpan>[정답]</EmSpan> 맞히고 점수 받기{" "}
        </div>
        <div>
          ③ <EmSpan>[해설]</EmSpan> 확인하고 추가 점수 받기
        </div>
      </WhiteBox>
      {status == QUIZ_STATUS.QUIZ && (
        <div className="h-full flex flex-col flex-1">
          <Quiz handleClick={handleClick} quiz={data} />
        </div>
      )}
      {(status === QUIZ_STATUS.CORRECT || status === QUIZ_STATUS.WRONG) && (
        <div className="flex flex-col items-center justify-center h-full">
          <Result
            explanation={data?.explanation || "해설이 없습니다."}
            setStatus={setStatus}
            status={status}
          />
        </div>
      )}
    </div>
  );
}
