import { useState } from "react";
import ReactModal from "react-modal";
import CommonModal from "./CommonModal";

interface ButtonModalProps {
  title: string; // Title for the modal
  contents: string[]; // Contents for the modal
  buttonText: string; // Text for the button
  onClickButton: () => void; // Optional click handler for the button
  isOpen: boolean; // Optional prop to control modal visibility
  isList?: boolean; // Optional prop to display contents as a list
}

const ButtonModal = ({
  title,
  contents,
  buttonText,
  onClickButton,
  isOpen,
  isList,
}: ButtonModalProps) => {
  return (
    <CommonModal modalIsOpen={isOpen}>
      <div className="flex flex-col text-center">
        <div className="flex flex-col gap-1 mb-6">
          <strong className="text-xl">{title}</strong>
          <div className="flex flex-col mt-1">
            {contents.map((content, index) =>
              isList ? (
                <li className="font-normal list-disc pl-4" key={index}>
                  {content}
                </li>
              ) : (
                <div className="font-normal" key={index}>
                  {content}
                </div>
              )
            )}
          </div>
        </div>
        <button
          className="bg-primary text-white py-2 px-4 rounded-lg cursor-pointer"
          onClick={onClickButton}
        >
          {buttonText}
        </button>
      </div>
    </CommonModal>
  );
};

export default ButtonModal;
