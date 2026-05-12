"use client";

import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useModelKeysStore } from "@/stores/useModelKeysStore";
import { useT } from "@/lib/i18n/context";
import type { BaseModelMeta } from "@/lib/models/baseModels";
import type { Dict } from "@/lib/i18n/en";
import { toast } from "sonner";

export function ModelKeyCard({ model }: { model: BaseModelMeta }) {
  const t = useT();
  const storedKey = useModelKeysStore((s) => s.keys[model.id] ?? "");
  const setKey = useModelKeysStore((s) => s.setKey);
  const removeKey = useModelKeysStore((s) => s.removeKey);

  const [draft, setDraft] = useState(storedKey);
  const [show, setShow] = useState(false);

  // Sync from store when user switches accounts (rehydrate fires).
  useEffect(() => {
    setDraft(storedKey);
  }, [storedKey]);

  const configured = storedKey.length > 0;
  const dirty = draft.trim() !== storedKey;
  const meta = t.models[model.i18nKey as keyof Dict["models"]];

  const save = () => {
    const v = draft.trim();
    if (!v) return;
    setKey(model.id, v);
    toast.success(`${meta.name} · ${t.settings.keySavedToast}`);
  };

  const remove = () => {
    removeKey(model.id);
    setDraft("");
    toast.message(`${meta.name} · ${t.settings.keyRemoved}`);
  };

  return (
    <div className="rounded-[16px] border border-[#e5e5e5] bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#fafaf9] text-[14px] font-medium tracking-tight text-[#111111]">
          {model.initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-[14.5px] font-medium tracking-tight">
              {meta.name}
            </div>
            {configured ? (
              <Badge variant="success" className="px-2 py-0.5 text-[10px]">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
                {t.settings.savedBadge}
              </Badge>
            ) : (
              <Badge variant="muted" className="px-2 py-0.5 text-[10px]">
                {t.settings.notConfigured}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 text-[12px] leading-tight text-[#666666]">
            {meta.tagline}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <a
            href={model.keyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-[10.5px] tracking-tight text-[#666666] hover:border-[#111111] hover:text-[#111111]"
          >
            {t.settings.getKeyLink}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href={model.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-[10.5px] tracking-tight text-[#666666] hover:border-[#111111] hover:text-[#111111]"
          >
            {t.settings.docsLink}
          </a>
        </div>
      </div>

      <div className="mt-4 flex items-stretch gap-2">
        <div className="relative flex-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            type={show ? "text" : "password"}
            placeholder={model.placeholder}
            className="pr-9 font-mono text-[12.5px]"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-[#999999] hover:bg-[#fafaf9] hover:text-[#111111]"
            aria-label={show ? t.settings.keyShown : t.settings.keyHidden}
          >
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        <Button
          onClick={save}
          disabled={!dirty || !draft.trim()}
          variant="primary"
          size="md"
        >
          {t.settings.saveBtn}
        </Button>
        {configured && (
          <Button onClick={remove} variant="secondary" size="icon" title={t.settings.removeBtn}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
