import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "outline" | "muted";

const variantClass: Record<Variant, string> = {
  default: "bg-[#111111] text-white border-transparent",
  success: "bg-[#ecfdf5] text-[#0ea56b] border-[#bbf7d0]",
  warning: "bg-[#fef9ed] text-[#b97a13] border-[#fde9b3]",
  outline: "bg-white text-[#111111] border-[#e5e5e5]",
  muted: "bg-[#f7f7f5] text-[#666666] border-[#e5e5e5]",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight",
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
}
