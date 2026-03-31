import { Badge as UiBadge } from "../ui/badge";

type Props = {
  label: string;
  tone?: "verified" | "premium" | "neutral";
};

const toneVariantMap: Record<
  NonNullable<Props["tone"]>,
  "default" | "secondary" | "outline"
> = {
  verified: "default",
  premium: "secondary",
  neutral: "outline",
};

export default function Badge({ label, tone = "neutral" }: Props) {
  return (
    <UiBadge variant={toneVariantMap[tone]}>{label}</UiBadge>
  );
}
