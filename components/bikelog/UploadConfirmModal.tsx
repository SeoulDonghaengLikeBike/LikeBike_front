import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import ReactModal from "react-modal";

interface UploadConfirmModalProps {
  hatPreview: string | null;
  bikePreview: string | null;
  confirmOpen: boolean;
  onCancel: () => void;
  onOk: () => void;
}

const UploadConfirmModal = ({
  hatPreview,
  bikePreview,
  confirmOpen,
  onCancel,
  onOk,
}: UploadConfirmModalProps) => {
  return (
    <>
      <ReactModal
        contentLabel="Confirm Modal"
        ariaHideApp={false}
        isOpen={confirmOpen}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            transform: "translate(-50%, -50%)",
            zIndex: 60,
            width: "90%",
            maxWidth: "400px",
            padding: 0,
          },
          overlay: {
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <div className="text-lg flex flex-col w-full">
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col items-center">
              <strong>사진 확인</strong>
              <p>아래 사진으로 인증을 진행합니다</p>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex flex-col gap-2 text-center flex-1">
                <img
                  alt="preview"
                  src={hatPreview || undefined}
                  className="bg-gray-200 rounded-md w-full"
                  style={{
                    aspectRatio: "1/1",
                    objectFit: "cover",
                  }}
                />
                <p className="text-md">안전모+사용자</p>
              </div>
              <div className="flex flex-col gap-2 text-center flex-1">
                <img
                  alt="preview"
                  src={bikePreview || undefined}
                  className="bg-gray-200 rounded-md w-full"
                  style={{
                    aspectRatio: "1/1",
                    objectFit: "cover",
                  }}
                />
                <p>자전거</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 flex">
            <div
              className="flex-1 flex justify-center items-center p-4 border-r border-gray-300 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onCancel();
              }}
            >
              취소
            </div>
            <div
              className="flex-1 flex justify-center items-center p-4 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onOk();
              }}
            >
              확인
            </div>
          </div>
        </div>
      </ReactModal>
    </>
  );
};

export default UploadConfirmModal;
