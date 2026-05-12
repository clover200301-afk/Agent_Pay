"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { Logo } from "@/components/ui/logo";
import { AgentPreview } from "@/components/landing/AgentPreview";
import { useT } from "@/lib/i18n/context";
import { toast } from "sonner";

interface OAuthAvailability {
  google: boolean;
  apple: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [email, setEmail] = useState("agent@agentpay.dev");
  const [password, setPassword] = useState("demo-password");
  const [submitting, setSubmitting] = useState(false);
  const [oauth, setOauth] = useState<OAuthAvailability>({
    google: false,
    apple: false,
  });

  useEffect(() => {
    // Probes the server for which OAuth providers are wired up. The route
    // itself comes from NextAuth's /api/auth/providers.
    let aborted = false;
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((providers: Record<string, unknown>) => {
        if (aborted) return;
        setOauth({
          google: Boolean(providers?.google),
          apple: Boolean(providers?.apple),
        });
      })
      .catch(() => undefined);
    return () => {
      aborted = true;
    };
  }, []);

  const onCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setSubmitting(false);
    if (res?.error) {
      toast.error("Email or password invalid (min 4 chars).");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const onOAuth = (provider: "google" | "apple") => {
    if (!oauth[provider]) {
      toast.message(t.auth.oauthDisabledHint);
      return;
    }
    void signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-12">
        {/* Left — narrative */}
        <motion.section
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-12 flex flex-col justify-between border-r border-[#e5e5e5] bg-[#fafaf9] px-8 py-10 lg:col-span-4 lg:px-12 lg:py-12"
        >
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo size={24} />
            </Link>
            <LanguageToggle />
          </div>

          <div className="my-12 lg:my-0">
            <Badge variant="outline" className="mb-5 gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0ea56b] pulse-dot" />
              {t.common.demoMode}
            </Badge>
            <h1 className="text-[40px] font-medium leading-[1.05] tracking-[-0.04em]">
              {t.hero.titleLine1}
              <br />
              {t.hero.titleLine2}
            </h1>
            <p className="mt-5 max-w-[360px] text-[14px] leading-[1.55] text-[#666666]">
              {t.hero.subtitle}
            </p>
          </div>

          <div className="text-[12px] leading-[1.55] text-[#666666]">
            {t.login.readOverviewPrefix}{" "}
            <Link href="/" className="text-[#111111] underline-offset-4 hover:underline">
              {t.login.readOverview}
            </Link>
          </div>
        </motion.section>

        {/* Center — sign in card */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-12 flex items-center justify-center px-6 py-12 lg:col-span-5 lg:px-10"
        >
          <div className="w-full max-w-[420px]">
            <div className="mb-1 text-[12px] font-medium tracking-[0.18em] uppercase text-[#666666]">
              {t.login.welcomeBack}
            </div>
            <h2 className="text-[28px] font-medium leading-[1.1] tracking-[-0.03em]">
              {t.login.title}
            </h2>
            <p className="mt-2 text-[13px] text-[#666666]">{t.login.subtitle}</p>

            <div className="mt-7 space-y-2">
              <OAuthButton
                provider="google"
                enabled={oauth.google}
                onClick={() => onOAuth("google")}
                label={t.auth.signInWithGoogle}
                disabledHint={t.auth.oauthDisabledHint}
              />
              <OAuthButton
                provider="apple"
                enabled={oauth.apple}
                onClick={() => onOAuth("apple")}
                label={t.auth.signInWithApple}
                disabledHint={t.auth.oauthDisabledHint}
              />
            </div>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-[11px] tracking-[0.18em] uppercase text-[#999999]">
                {t.login.or}
              </span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={onCredentialsSignIn} className="space-y-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[12px] tracking-tight text-[#666666]">
                  <Mail className="h-3.5 w-3.5" />
                  {t.login.email}
                </label>
                <Input
                  type="email"
                  placeholder="agent@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[12px] tracking-tight text-[#666666]">
                  <Lock className="h-3.5 w-3.5" />
                  {t.login.password}
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                />
              </div>
              <Button type="submit" size="lg" className="mt-2 w-full" disabled={submitting}>
                {t.common.signIn}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-[11px] tracking-[0.18em] uppercase text-[#999999]">
                {t.login.or}
              </span>
              <Separator className="flex-1" />
            </div>

            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;
                return (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={connected ? openAccountModal : openConnectModal}
                    className="w-full"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#111111]" />
                    {connected
                      ? `${t.login.connectedPrefix} ${account.displayName}`
                      : t.common.connectWallet}
                  </Button>
                );
              }}
            </ConnectButton.Custom>

            <div className="mt-6 text-center text-[12px] text-[#666666]">
              {t.login.disclaimer}
            </div>
          </div>
        </motion.section>

        {/* Right — preview */}
        <motion.section
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="hidden border-l border-[#e5e5e5] bg-[#fafaf9] px-8 py-12 lg:col-span-3 lg:flex lg:flex-col lg:justify-center"
        >
          <div className="text-[12px] font-medium tracking-[0.18em] text-[#666666] uppercase">
            {t.login.rightEyebrow}
          </div>
          <h3 className="mt-2 text-[20px] font-medium tracking-tight">{t.login.rightTitle}</h3>
          <p className="mt-2 max-w-[260px] text-[12px] leading-[1.55] text-[#666666]">
            {t.login.rightBody}
          </p>
          <div className="mt-6">
            <AgentPreview />
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function OAuthButton({
  provider,
  enabled,
  onClick,
  label,
  disabledHint,
}: {
  provider: "google" | "apple";
  enabled: boolean;
  onClick: () => void;
  label: string;
  disabledHint: string;
}) {
  return (
    <button
      onClick={onClick}
      title={enabled ? undefined : disabledHint}
      className={[
        "group flex w-full items-center justify-center gap-2.5 rounded-[12px] border border-[#e5e5e5] bg-white px-4 py-3 text-[13.5px] font-medium tracking-tight transition-all",
        enabled
          ? "hover:border-[#111111] hover:shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_24px_-12px_rgba(17,17,17,0.18)]"
          : "cursor-not-allowed opacity-55",
      ].join(" ")}
    >
      <OAuthIcon provider={provider} />
      <span>{label}</span>
      {!enabled && (
        <span className="ml-1 rounded-full bg-[#fafaf9] px-1.5 py-0.5 text-[10px] tracking-tight text-[#999999]">
          .env
        </span>
      )}
    </button>
  );
}

function OAuthIcon({ provider }: { provider: "google" | "apple" }) {
  if (provider === "google") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.67-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.16-3.16C17.46 2.1 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="#111111">
      <path d="M16.37 1.43c0 1.14-.46 2.27-1.22 3.08-.81.88-2.14 1.55-3.23 1.46-.13-1.1.41-2.27 1.16-3.04.83-.88 2.25-1.55 3.29-1.5Zm3.5 17.13c-.65 1.5-.96 2.18-1.8 3.51-1.17 1.86-2.82 4.17-4.85 4.19-1.81.02-2.28-1.18-4.74-1.17-2.46.01-2.98 1.19-4.79 1.17-2.03-.02-3.59-2.11-4.76-3.97C-1.5 18.99-2 12.74.41 9.4c1.73-2.39 4.48-3.79 7.06-3.79 2.63 0 4.29 1.45 6.46 1.45 2.11 0 3.39-1.45 6.43-1.45 2.31 0 4.78 1.26 6.54 3.44-5.77 3.16-4.83 11.42-1.03 13.51Z" />
    </svg>
  );
}
