import React from "react";

const TabList = ({
  onClick,
  active,
  isRed,
  children,
}: {
  onClick: () => void;
  active: boolean;
  isRed?: boolean; // Optional prop to indicate if that tab should be red
  children: React.ReactNode;
}) => {
  return active ? (
    <div
      className={`flex-1 default-border py-4 text-center font-bold ${isRed ? "bg-contrast" : "bg-secondary-light"} rounded-t-3xl  cursor-pointer text-lg`}
      onClick={onClick}
    >
      {children}
    </div>
  ) : (
    <div
      className="flex-1 py-4 default-border text-center text-gray-medium font-bold bg-gray-lightest rounded-t-3xl cursor-pointer text-lg"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// 성능 최적화: React.memo로 래핑
// 이유: 부모 컴포넌트가 리렌더링될 때 불필요하게 TabList가 리렌더링되는 것을 방지
// onClick 함수는 매번 새로 생성되지만, 이는 내부 처리 필요 (현재는 그대로 사용)
export default React.memo(TabList);
