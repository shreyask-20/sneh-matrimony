"use client";

import type React from "react";
import { useRef, useState } from "react";
import { Button as UiButton } from "../ui/button";
import { cn } from "@/lib/utils";

type AnimatedGradientButtonProps = React.ComponentProps<typeof UiButton> & {
  highlightColors?: {
    primary: string;
    secondary: string;
  };
};

export default function AnimatedGradientButton({
  className,
  children,
  highlightColors = {
    primary: "rgba(255, 179, 213, 0.10)",
    secondary: "rgba(244, 94, 155, 0.2)",
  },
  ...props
}: AnimatedGradientButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || isFocused) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <UiButton
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden border border-brand-200/70 bg-transparent text-brand-100/90 shadow-soft transition-colors hover:border-brand-10/80 hover:text-black",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(120px circle at ${position.x}px ${position.y}px, ${highlightColors.primary}, ${highlightColors.secondary} 45%, rgba(63, 7, 30, 0.05) 70%, transparent 85%)`,
        }}
      />
      <span className="relative z-10">{children}</span>
    </UiButton>
  );
}
