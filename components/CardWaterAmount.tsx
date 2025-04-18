import { Card } from "@/components/ui/Card";
import { useWater } from "@/hooks/useWater";

export default function CardWaterAmount() {
  const { water, percentOfDailyWater } = useWater();

  const backgroundArr: { [k: number]: string } = {
    5: "bg-blue-500/5",
    10: "bg-blue-500/10",
    15: "bg-blue-500/15",
    20: "bg-blue-500/20",
    25: "bg-blue-500/25",
    30: "bg-blue-500/30",
    35: "bg-blue-500/35",
    40: "bg-blue-500/40",
    45: "bg-blue-500/45",
    50: "bg-blue-500/50",
    55: "bg-blue-500/55",
    60: "bg-blue-500/60",
    65: "bg-blue-500/65",
    70: "bg-blue-500/70",
    75: "bg-blue-500/75",
    80: "bg-blue-500/80",
    85: "bg-blue-500/85",
    90: "bg-blue-500/90",
    95: "bg-blue-500/95",
    100: "bg-blue-500/100",
  };

  return (
    <Card
      className={"flex-1 transition-all duration-300"}
      title={`${water}ml`}
      description={`Water amount`}
      backgroundColor={backgroundArr[percentOfDailyWater] || "bg-blue-500/5"}
    />
  );
}
