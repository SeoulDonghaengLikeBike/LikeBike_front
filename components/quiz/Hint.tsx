import Image from "next/image";
import Link from "next/link";

interface Props {
  hint_link: string | undefined;
  hint_description: string | undefined;
}

const Hint = ({ hint_link, hint_description }: Props) => {
  return (
    (hint_link || hint_description) && (
      <>
        <Image width={24} height={24} alt="hint" src={"/icons/question.svg"} />
        {hint_link ? (
          <a href={hint_link}>
            <div className=" text-primary ml-[4px] underline">
              {hint_description ?? "힌트 보러 가기"}
            </div>
          </a>
        ) : (
          hint_description && (
            <div className=" text-primary ml-[4px]">{hint_description}</div>
          )
        )}
      </>
    )
  );
};

export default Hint;
