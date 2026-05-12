"use client";

import Link from "next/link";
import { ArrowLeft, KeyRound, ExternalLink, Copy, Trash2, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useApiKeysStore } from "@/stores/useApiKeysStore";
import { EXPLORER_URL } from "@/lib/chain";
import { formatAddress } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import { toast } from "sonner";

export default function ApiKeysPage() {
  const t = useT();
  const keys = useApiKeysStore((s) => s.keys);
  const removeKey = useApiKeysStore((s) => s.removeKey);

  const copy = async (value: string, msg: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(msg);
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main className="grid h-screen w-full grid-cols-[260px_minmax(0,1fr)] bg-white">
      <Sidebar />

      <section className="scrollbar-thin flex h-screen flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#e5e5e5]/70 bg-white/80 px-8 backdrop-blur-md">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.settings.backToDashboard}
            </Button>
          </Link>
          <div className="ml-auto">
            <LanguageToggle size={32} />
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1000px] px-8 py-10">
          <div className="text-[12px] font-medium tracking-[0.18em] uppercase text-[#666666]">
            {t.apiKeys.title}
          </div>
          <h1 className="mt-1 text-[28px] font-medium leading-[1.1] tracking-[-0.03em]">
            {t.apiKeys.title}
          </h1>
          <p className="mt-2 max-w-[60ch] text-[13px] text-[#666666]">
            {t.apiKeys.subtitle}
          </p>

          {keys.length === 0 ? (
            <div className="mt-10 flex flex-col items-center rounded-[18px] border border-dashed border-[#e5e5e5] bg-white px-8 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fafaf9]">
                <KeyRound className="h-5 w-5 text-[#666666]" />
              </div>
              <div className="mt-3 text-[15px] font-medium tracking-tight">
                {t.apiKeys.emptyTitle}
              </div>
              <p className="mt-1.5 max-w-[48ch] text-[12.5px] leading-[1.55] text-[#666666]">
                {t.apiKeys.emptyBody}
              </p>
              <Link href="/dashboard" className="mt-5">
                <Button variant="primary" size="md">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t.apiKeys.runFirstTask}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-[16px] border border-[#e5e5e5] bg-white">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-[#fafaf9] text-[10.5px] tracking-[0.16em] uppercase text-[#666666]">
                  <tr>
                    <Th>{t.apiKeys.colProvider}</Th>
                    <Th>{t.apiKeys.colPrice}</Th>
                    <Th>{t.apiKeys.colKey}</Th>
                    <Th>{t.apiKeys.colTxHash}</Th>
                    <Th>{t.apiKeys.colCreatedAt}</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} className="border-t border-[#f0f0ee]">
                      <Td>
                        <div className="font-medium tracking-tight">{k.providerName}</div>
                        <div className="text-[10.5px] text-[#999999]">{k.providerId}</div>
                      </Td>
                      <Td>
                        <span className="tnum">
                          {k.priceUsdc.toFixed(2)}{" "}
                          <span className="text-[10px] text-[#999999]">USDC</span>
                        </span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <code className="max-w-[200px] truncate rounded-md bg-[#fafaf9] px-2 py-1 font-mono text-[11px]">
                            {k.apiKey}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copy(k.apiKey, t.tx.apiKeyCopied)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </Td>
                      <Td>
                        {k.txHash ? (
                          <div className="flex items-center gap-1.5">
                            <code className="font-mono text-[11px]">
                              {formatAddress(k.txHash, 6)}
                            </code>
                            <a
                              href={`${EXPLORER_URL}/tx/${k.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#666666] hover:text-[#111111]"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#999999]">—</span>
                        )}
                      </Td>
                      <Td>
                        <span className="text-[11.5px] text-[#666666]">{formatTime(k.createdAt)}</span>
                      </Td>
                      <Td>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t.apiKeys.delete}
                          onClick={() => {
                            removeKey(k.id);
                            toast.message(t.apiKeys.removed);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[#666666]" />
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {keys.length > 0 && (
                <div className="border-t border-[#f0f0ee] bg-[#fafaf9] px-4 py-2 text-right">
                  <Badge variant="muted" className="text-[10.5px]">
                    {keys.length}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children }: { children?: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}
