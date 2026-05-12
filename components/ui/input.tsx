import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-11 w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3.5 py-2 text-sm text-[#111111] placeholder:text-[#999999] outline-none transition-colors focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/8 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex w-full rounded-[14px] border border-[#e5e5e5] bg-white px-4 py-3 text-[15px] text-[#111111] placeholder:text-[#999999] outline-none transition-colors focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/8 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
