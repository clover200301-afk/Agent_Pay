"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** 控件总尺寸（像素），默认 36 */
  size?: number;
}

/**
 * 中英语言切换按钮 —— 单一形态、点击翻转：
 *
 * 中文状态：左上「中」深色大字 / 右下「EN」浅色小字
 * 英文状态：左上「EN」深色大字 / 右下「中」浅色小字
 *
 * 整体是一个圆形按钮，没有任何外部标签。
 */
export function LanguageToggle({ className, size = 36 }: Props) {
  const { locale, setLocale, t } = useLocale();
  const next = locale === "zh" ? "en" : "zh";

  const primaryChar = locale === "zh" ? "中" : "EN";
  const secondaryChar = locale === "zh" ? "EN" : "中";

  // EN 是双字符，需要更小的字号才能稳定塞进角上的小位置
  const primaryFontSize = primaryChar === "EN" ? size * 0.34 : size * 0.46;
  const secondaryFontSize = secondaryChar === "EN" ? size * 0.24 : size * 0.28;

  return (
    <button
      onClick={() => setLocale(next)}
      aria-label={t.language.label}
      title={t.language.label}
      className={cn(
        "relative shrink-0 rounded-full border border-[#e5e5e5] bg-white transition-all hover:border-[#111111] hover:shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_18px_-8px_rgba(17,17,17,0.16)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* 主字符：左上、大、深 */}
      <motion.span
        key={`primary-${primaryChar}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="absolute font-medium leading-none tracking-tight text-[#111111]"
        style={{
          top: size * 0.15,
          left: size * 0.18,
          fontSize: primaryFontSize,
        }}
      >
        {primaryChar}
      </motion.span>

      {/* 副字符：右下、小、浅 */}
      <motion.span
        key={`secondary-${secondaryChar}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="absolute font-medium leading-none tracking-tight text-[#bdbdbd]"
        style={{
          bottom: size * 0.18,
          right: size * 0.18,
          fontSize: secondaryFontSize,
        }}
      >
        {secondaryChar}
      </motion.span>
    </button>
  );
}
