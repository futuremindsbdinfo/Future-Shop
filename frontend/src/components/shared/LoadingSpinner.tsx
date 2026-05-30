import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_MAP = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} as const;

interface LoadingSpinnerProps {
  size?: keyof typeof SIZE_MAP;
  className?: string;
  /** Optional centering into available height. */
  fullHeight?: boolean;
}

export function LoadingSpinner({ size = "md", className, fullHeight = false }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullHeight ? "min-h-[40vh]" : "p-4",
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <Loader2 className={cn("animate-spin text-[#1a6bdf]", SIZE_MAP[size])} />
    </div>
  );
}
