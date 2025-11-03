import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import ReactModal from "react-modal";

interface UploadModalProps {
  upload: {
    title: string;
    contents: string[];
    isOpen: boolean;
    setOpen?: (open: boolean) => void;
  };
  confirm: {
    title: string;
    onOk: (file: File) => void;
  };
  prefix?: string;
}

const UploadModal = ({
  upload: { title, contents, isOpen, setOpen },
  confirm: { title: confirmTitle, onOk },
  prefix,
}: UploadModalProps) => {
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleCapture = (target: HTMLInputElement) => {
    const files = target.files;
    if (!files || files.length === 0) return;

    const newFile = files[0];

    const newUrl = URL.createObjectURL(newFile);
    if (preview) {
      setTimeout(() => URL.revokeObjectURL(preview), 200);
    }
    setFile(newFile);
    setPreview(newUrl);

    setTimeout(() => setConfirmOpen(true), 0);
    target.value = "";
  };

  return (
    <>
      {/* 📸 업로드 모달 */}
      <ReactModal
        ariaHideApp={false}
        contentLabel="Upload Modal"
        isOpen={isOpen}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            transform: "translate(-50%, -50%)",
            zIndex: 40,
            width: "90%",
            maxWidth: "400px",
            padding: 0,
            boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.5)",
          },
          overlay: {
            zIndex: 30,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <div className="p-6 flex flex-col text-center relative">
          <div className="cursor-pointer absolute top-2 right-2 z-10 px-4 py-2">
            <CloseIcon onClick={() => setOpen?.(false)} />
          </div>
          <div className="flex flex-col gap-1 mb-6">
            <strong className="text-lg">{title}</strong>
            <div>
              {contents?.map((content, index) => <p key={index}>{content}</p>)}
            </div>
          </div>

          <label
            className="bg-primary text-white py-2 px-4 rounded-lg cursor-pointer"
            htmlFor={`${prefix}-image`}
          >
            사진 업로드하기
          </label>
          <input
            id={`${prefix}-image`}
            type="file"
            accept="image/*"
            onChange={(e) => handleCapture(e.target)}
            style={{
              visibility: "hidden",
              position: "absolute",
              top: 0,
            }}
            multiple
          />
        </div>
      </ReactModal>

      {/* ✅ 확인 모달 */}
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
        <div className="text-lg flex flex-col">
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col items-center">
              <strong>아래 사진으로</strong>
              <strong>{confirmTitle}</strong>
            </div>

            <img
              alt="preview"
              src={preview}
              className="bg-gray-200 min-h-[200px] rounded-md"
              style={{
                width: "100%",
                aspectRatio: "1/1",
                objectFit: "cover",
              }}
            />
          </div>

          <div className="border-t border-gray-300 flex">
            <div
              className="flex-1 flex justify-center items-center p-4 border-r border-gray-300 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setConfirmOpen(false);
                setPreview("");
              }}
            >
              아니오
            </div>
            <div
              className="flex-1 flex justify-center items-center p-4 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                if (file) {
                  setConfirmOpen(false);
                  onOk(file);
                } else {
                  alert("파일이 업로드 되지 않았습니다");
                }
              }}
            >
              예
            </div>
          </div>
        </div>
      </ReactModal>
    </>
  );
};

export default UploadModal;
