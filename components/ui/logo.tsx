import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

/** 产品标识：行星图标 + 可选的 "AgentPay" 文字。
 *  默认尺寸 24px，配合 wordmark 整体高度大约 24px，与原先黑色方块占位保持一致。 */
export function Logo({
  size = 24,
  className,
  showWordmark = true,
  wordmarkClassName,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="AgentPay"
        width={size}
        height={size}
        priority
        className="select-none"
        style={{ width: size, height: size }}
      />
      {showWordmark && (
        <span
          className={cn(
            "text-[15px] font-medium tracking-tight",
            wordmarkClassName
          )}
        >
          AgentPay
        </span>
      )}
    </div>
  );
}
