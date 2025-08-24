import { useState } from "react";
import CommonModal from "../common/CommonModal";
import CloseIcon from "@mui/icons-material/Close";
import Markdown from "react-markdown";

export default function GuideButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);

  return (
    <>
      <CommonModal modalIsOpen={modalOpen} hasBackdrop fullHeight>
        <div className="h-full w-full overflow-y-hidden pb-[64px]">
          <div className="flex flex-row justify-end">
            <button
              className="cursor-pointer pr-2"
              onClick={() => {
                setModalOpen(false);
                setShowResult(false);
              }}
            >
              <CloseIcon fontSize="large" />
            </button>
          </div>
          {showResult ? (
            <div className="flex flex-col items-center h-full justify-center gap-4">
              <div className="text-xl font-bold text-center">
                🚀 <br />
                다음 레벨 달성 전략
              </div>
              <div className="p-2 text-justify break-all text-lg whitespace-pre-line">
                <Markdown>
                  {`🤖: 현재 사용자님의 점수는 310점으로 중급자에 해당합니다. 이번 주에는 아직 활동 인증과 안전 퀴즈를 하지 않으셨으므로 다음과 같은 방법으로 남은 기간 동안 점수를 획득하실 수 있습니다. 
                  1. **활동 인증**: 하루에 한 번씩 총 3번 가능합니다.\n(금, 토, 일) -> 90점 추가 가능
                2. **안전 퀴즈**: 하루에 한 번씩 총 3번 가능합니다. (금, 토, 일) -> 60점 추가 가능 따라서 위의 방법들을 모두 활용하신다면 최대 150점의 점수를 추가로 얻으실 수 있으며, 이를 통해 총 점수가 460점이 되어 '숙련자' 단계로 진입할 수 있게 됩니다.
단, 각 활동은 매일 꾸준히 진행해야 하며 주말 동안 모든 활동을 완료하는 것이 좋습니다. 
또한, 활동 인증을 할 때는 반드시 안전한 환경에서 자전거를 타는 것을 권장 드립니다.`}
                </Markdown>
              </div>
              <button
                className="text-xl font-bold text-white py-2 px-4 rounded-lg cursor-pointer bg-primary"
                onClick={() => {
                  setModalOpen(false);
                  setShowResult(false);
                }}
              >
                활동하러 가기
              </button>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col justify-center text-center gap-4">
              <div className="text-xl font-bold">
                🎯
                <br /> 다음 레벨을 위한
                <br />
                AI 가이드가 준비됐습니다
                <br /> 확인해볼까요?
              </div>
              <div>
                <button
                  className=" text-xl font-bold text-white py-2 px-4 rounded-lg cursor-pointer bg-primary"
                  onClick={() => setShowResult(true)}
                >
                  가이드 확인하기
                </button>
              </div>
            </div>
          )}
        </div>
      </CommonModal>
      <div
        onClick={() => {
          setModalOpen(true);
        }}
        className="mb-2 p-3 rounded-[16px] flex flex-col items-center justify-center border-[1.5px] border-gray-lightest bg-secondary-light cursor-pointer"
      >
        🎯 다음 단계로 가기 위한 가이드를 확인해 보세요!
      </div>
    </>
  );
}
