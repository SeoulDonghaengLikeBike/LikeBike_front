import Image from "next/image";
import Link from "next/link";

interface Props {
  hint_link: string | undefined;
  hint_explation: string | undefined;
}

const Hint = ({ hint_link, hint_explation }: Props) => {
  return (
    (hint_link || hint_explation) && (
      <>
        <Image width={24} height={24} alt="hint" src={"/icons/question.svg"} />
        {hint_link ? (
          <Link href={hint_link}>
            <div className=" text-primary ml-[4px] underline">
              {hint_explation ?? "힌트 보러 가기"}
            </div>
          </Link>
        ) : (
          hint_explation && (
            <div className=" text-primary ml-[4px]">{hint_explation}</div>
          )
        )}
      </>
    )
  );
};

export default Hint;
