import { useRouter } from "next/navigation";

import ScoreLabel from "./ScoreLabel";

const MainBase = ({
  title,
  chipTitle,
  path,
  scoreText,
  children,
}: {
  title: string;
  chipTitle: string;
  path: string;
  scoreText: string;
  children?: React.ReactNode;
}) => {
  const router = useRouter();

  return (
    <div
      className="card relative gap-2 text-center flex-1 "
      // onClick={() => router.push(path)}
    >
      <ScoreLabel text={scoreText} />
      {children && children}
      <div className="bg-secondary px-3 py-1 rounded-[30px] text-xs">
        {chipTitle}
      </div>
      <div className="text-[20px] font-bold whitespace-nowrap">{title}</div>
    </div>
  );
};

export default MainBase;
