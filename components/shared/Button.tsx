import type React from "react";
import { Button as UiButton } from "../ui/button";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = React.ComponentProps<typeof UiButton> & {
  variant?: Variant;
  size?: Size;
};

const variantMap: Record<Variant, "default" | "secondary" | "ghost"> = {
  primary: "default",
  secondary: "secondary",
  ghost: "ghost",
};

export default function Button({
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const sizeMap: Record<Size, "sm" | "default" | "lg"> = {
    sm: "sm",
    md: "default",
    lg: "lg",
  };
  return (
    <UiButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      {...props}
    />
  );
}
