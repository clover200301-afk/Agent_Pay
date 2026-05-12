import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[10px] bg-[#f1f1ee] animate-pulse",
        className
      )}
      {...props}
    />
  );
}
