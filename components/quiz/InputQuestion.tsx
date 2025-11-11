import { IQuiz } from "@/types/quiz";
import Image from "next/image";
import Link from "next/link";
import Hint from "./Hint";

interface Props {
  quiz: IQuiz | undefined;
  answer: string;
  setAnswer: (value: string) => void;
}

const InputQuestion = ({ quiz, answer, setAnswer }: Props) => {
  return (
    <div className="mt-4 h-full">
      <input
        className="border-b-black border-b-1 w-full text-center text-lg  focus:outline-none p-1"
        maxLength={8}
        placeholder="정답을 입력해주세요"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <div className="flex flex-row align-center mt-2 mb-8 justify-center">
        <Hint
          hint_description={quiz?.hint_description}
          hint_link={quiz?.hint_link}
        />
      </div>
    </div>
  );
};

export default InputQuestion;
