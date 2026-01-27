import dayjs from "dayjs";
import Image from "next/image";
import { useMemo, useState } from "react";

import { IQuiz, QUIZ_TYPE } from "@/types/quiz";

import Button from "../common/Button";
import SelectQuestion from "./SelectQuestion";
import InputQuestion from "./InputQuestion";
import OXQuestion from "./OXQuestion";

const Quiz = ({
  quiz,
  handleClick,
}: {
  quiz: IQuiz | undefined;
  handleClick: (selectedValue: string) => void;
}) => {
  const [answer, setAnswer] = useState("");
  // 성능 최적화: useMemo로 메모이제이션
  // 이유: quizType은 quiz.quiz_type이 변경될 때만 재계산
  // 매 렌더링마다 새로운 값이 생성되면 자식 컴포넌트가 불필요하게 리렌더링됨
  const quizType: QUIZ_TYPE = useMemo(
    () => quiz?.quiz_type ?? QUIZ_TYPE.SELECT,
    [quiz?.quiz_type],
  );

  if (!quiz) {
    return <div className="pt-4">오늘의 퀴즈가 게시되지 않았습니다.</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-secondary-light w-full flex flex-col items-center justify-center p-4 mt-4 text-2xl font-bold default-border ">
        {dayjs().format("YYYY - MM - DD")}
      </div>
      <div className="p-6 flex flex-col default-border bg-white h-full justify-between">
        <div className="flex flex-col gap-4 h-full">
          <div>{quiz?.question ? quiz.question : "문제가 없습니다."}</div>
          {/* <Link href={quiz?.hint_link ?? ""} className="text-blue-500 underline">
        <div className="p-2">힌트 보러 가기</div>
      </Link> */}
          {quizType == QUIZ_TYPE.SELECT && (
            <SelectQuestion quiz={quiz} answer={answer} setAnswer={setAnswer} />
          )}
          {quizType === QUIZ_TYPE.INPUT && (
            <InputQuestion quiz={quiz} answer={answer} setAnswer={setAnswer} />
          )}
          {quizType == QUIZ_TYPE.OX && (
            <OXQuestion quiz={quiz} answer={answer} setAnswer={setAnswer} />
          )}
        </div>
        <div className="w-full mt-4">
          <Button
            style={{
              width: "100%",
            }}
            onClick={() => {
              if (!answer || answer === "") return;
              handleClick(answer);
            }}
            disabled={!answer || answer === ""}
          >
            정답 제출하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
