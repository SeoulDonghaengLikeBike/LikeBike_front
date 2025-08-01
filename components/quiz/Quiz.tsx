import { IQuiz } from "@/types/quiz";
import { Checkbox } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import Button from "../common/Button";
import { useQuery } from "@tanstack/react-query";
import { getQuizStatus } from "@/apis/quiz/getQuizStaus";
import Image from "next/image";

const Quiz = ({
  quiz,
  handleClick,
}: {
  quiz: IQuiz | undefined;
  handleClick: (selectedValue: string) => void;
}) => {
  const [selectedValue, setSelectedValue] = useState("");

  console.log("quiz", quiz);
  if (!quiz) {
    return <div>오늘의 퀴즈가 게시되지 않았습니다.</div>;
  }

  return (
    <>
      <div className="bg-secondary-light w-full flex flex-col items-center justify-center p-4 mt-4 text-2xl font-bold default-border">
        {dayjs().format("YYYY - MM - DD")}
      </div>
      <div className="p-6 flex flex-col gap-4 default-border bg-white">
        <div>{quiz?.question ? quiz.question : "문제가 없습니다."}</div>
        {/* <Link href={quiz?.hint_link ?? ""} className="text-blue-500 underline">
        <div className="p-2">힌트 보러 가기</div>
      </Link> */}
        <div className="flex flex-col gap-2">
          {quiz?.answers.map((v, idx) => (
            <div
              key={idx}
              className={
                "py-4 px-6 bg-gray-lightest text-[#969696] flex flex-row gap-4 items-center " +
                (selectedValue === v
                  ? "border-2 border-primary bg-white text-primary"
                  : "")
              }
              onClick={() => setSelectedValue(v)}
              style={{ cursor: "pointer" }}
            >
              <Image
                src={
                  selectedValue === v
                    ? "/icons/selectedCheckbox.svg"
                    : "/icons/unselectedCheckbox.svg"
                }
                alt={selectedValue === v ? "selected" : "unselected"}
                width={30}
                height={30}
              />
              <div className="flex items-center h-[30px]">{v}</div>
            </div>
          ))}
        </div>
        <Button onClick={() => handleClick(selectedValue)}>
          정답 제출하기
        </Button>
      </div>
    </>
  );
};

export default Quiz;
