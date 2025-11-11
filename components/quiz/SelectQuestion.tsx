import { IQuiz } from "@/types/quiz";
import Hint from "./Hint";

interface Props {
  quiz: IQuiz | undefined;
  answer: string;
  setAnswer: (value: string) => void;
}

const SelectQuestion = ({ quiz, answer, setAnswer }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      {quiz?.answers.map((v, idx) => (
        <div
          key={idx}
          className={
            "py-4 px-6 bg-gray-lightest text-[#969696] flex flex-row gap-4 items-center " +
            (answer === v
              ? "border-2 border-primary bg-white text-primary"
              : "")
          }
          onClick={() => setAnswer(v)}
          style={{ cursor: "pointer" }}
        >
          <img
            alt={answer === v ? "selected" : "unselected"}
            height={30}
            src={
              answer === v
                ? "/icons/selectedCheckbox.svg"
                : "/icons/unselectedCheckbox.svg"
            }
            width={30}
          />
          <div className="flex items-center ">{v}</div>
        </div>
      ))}
      <div className="flex flex-row align-center my-2 justify-center">
        <Hint
          hint_description={quiz?.hint_description}
          hint_link={quiz?.hint_link}
        />
      </div>
    </div>
  );
};

export default SelectQuestion;
