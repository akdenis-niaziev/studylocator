import React from "react";
import { motion } from "framer-motion";

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors ${className}`}
      aria-label="Close"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </motion.button>
  );
};
