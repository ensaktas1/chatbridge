"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

export function BeuiButton({
  className = "",
  variant = "primary",
  size = "md",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`beui-button ${variant} ${size} ${className}`.trim()}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.94, y: 0 }}
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
