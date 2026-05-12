"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/15 focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[#111111] text-white hover:bg-[#1f1f1f] active:bg-[#000] shadow-[0_1px_2px_rgba(17,17,17,0.04),0_4px_12px_rgba(17,17,17,0.06)] hover:shadow-[0_2px_4px_rgba(17,17,17,0.06),0_8px_24px_rgba(17,17,17,0.10)]",
        secondary:
          "bg-[#f7f7f5] text-[#111111] hover:bg-[#efefec] border border-[#e5e5e5]",
        ghost:
          "bg-transparent text-[#111111] hover:bg-[#f7f7f5]",
        outline:
          "border border-[#e5e5e5] bg-white text-[#111111] hover:bg-[#fafaf9]",
        danger:
          "bg-white text-[#111111] border border-[#e5e5e5] hover:bg-[#fafaf9]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
