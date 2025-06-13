// Button component with brand styling
import React from "react";

interface BrandButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const BrandButton: React.FC<BrandButtonProps> = ({
  children,
  onClick,
  type = "button",
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn-brand flex items-center px-4 py-2 rounded-lg font-medium transition-all ${className}`}
    >
      {children}
    </button>
  );
};

export default BrandButton;
