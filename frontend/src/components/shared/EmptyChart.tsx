import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

/**
 * Centered placeholder for charts that have no data yet.
 * Drop in place of <ResponsiveContainer/> blocks.
 */
export function EmptyChart({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 text-center",
        className,
      )}
      role="status"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff7ed] text-[#f47920]">
        <FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />
      </span>
      <p className="text-sm text-[#6b7280]">{message}</p>
    </div>
  );
}
