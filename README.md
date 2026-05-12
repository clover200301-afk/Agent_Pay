<!--
AGENT-README: This block is optimized for AI agents (Claude Code, Cursor, etc.).
PROJECT: AgentPay — AI-native payment infrastructure on Monad. Hackathon MVP.
TECH:    Next.js 15 (App Router) + TypeScript + Tailwind v4 + shadcn-style primitives
         + Framer Motion + Zustand + wagmi v2 + viem + RainbowKit + Foundry (Solidity 0.8.28)
CHAIN:   Monad Testnet — chain ID 10143, RPC https://testnet-rpc.monad.xyz,
         explorer https://testnet.monadexplorer.com

QUICK START (3 commands):
  pnpm install
  cp .env.example .env.local                  # set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  pnpm dev                                    # demo runs in mocked-tx mode by default

DEPLOY THE CONTRACT (optional; demo works without it):
  curl -L https://foundry.paradigm.xyz | bash && foundryup
  echo "OWNER_PRIVATE_KEY=0x..." >> .env.local
  ./scripts/deploy.sh                         # writes NEXT_PUBLIC_AGENTPAY_ADDRESS back

DEMO PROMPT:
  "Buy the cheapest image generation API under 5 USDC"
-->

# AgentPay

> **Humans use apps. AI agents use AgentPay.**

🌐 [English](#english) · [中文](./README.zh.md)

AgentPay is an AI-native payment infrastructure demo built for the Monad hackathon. An autonomous agent searches digital service providers, compares prices, requests user approval, and settles the purchase on Monad — all in under 30 seconds.

The product narrative, design tokens, and demo flow are specified in [`PRD.md`](./PRD.md). Visual references live in [`images/`](./images/).

---

## English

### ⚡ 5-minute quick start

You don't need a wallet, you don't need a deployed contract, you don't need any API keys. The demo runs end-to-end in mocked-payment mode by default.

```bash
# 1. Install dependencies
pnpm install

# 2. Create your local env file (any value works for the demo)
cp .env.example .env.local

# 3. Run the dev server
pnpm dev
```

Open [`http://localhost:3000`](http://localhost:3000) — that's it. You'll see the landing page; click **Start Agent** to enter the workspace.

> **Don't have pnpm?** Install it once: `npm install -g pnpm`.

### 🎬 Beginner walkthrough — your first agent task

Follow this 30-second tour to see every feature of AgentPay in action.

#### Step 1 — Land

Visit [`http://localhost:3000`](http://localhost:3000). The hero shows a live, looping preview of an agent doing exactly what you're about to do. Click **Start Agent** in the top-right.

#### Step 2 — Sign in

You're on `/login`. Three ways to enter the workspace:

| Method | What happens |
| --- | --- |
| **Sign in** button | Demo mode — the email/password fields are decorative |
| **Connect Wallet** | Opens RainbowKit; pick MetaMask or any injected wallet on **Monad Testnet** |
| **Continue as guest** | Skips wallet, goes straight to the dashboard |

For your very first run, just click **Sign in**.

#### Step 3 — Describe a task

You're now on `/dashboard`. The center column has a large input asking _"What would you like your agent to do?"_

Click one of the example prompt chips, or type your own. The canonical demo prompt is:

```
Buy the cheapest image generation API under 5 USDC
```

Press **Enter** (or click the up-arrow button) to launch the agent.

#### Step 4 — Watch the workflow stream

The agent runs through 7 visible steps in about 5 seconds:

1. Understanding request
2. Searching providers
3. Comparing pricing
4. Evaluating reliability
5. Selecting provider
6. Preparing transaction
7. **Awaiting approval** ← this is where it pauses

Each step animates in with a shimmer effect. Three provider cards (VisionAPI, ImageForge, PixelMind) fade in below — the cheapest one (VisionAPI, 3.2 USDC) is highlighted as **Selected**.

#### Step 5 — Approve the payment

Look at the right rail. A **Payment Approval** card has slid in showing:
- Service: VisionAPI
- Price: 3.20 USDC
- Network: Monad Testnet
- Gas fee: ~0.0001 MON

Click **Approve Payment**.

#### Step 6 — See the settlement

The card flips to a **Transaction** state. After a 2-second confirming animation:
- ✅ Tx hash appears (click the external-link icon to open Monad Explorer in mock mode this is a synthetic hash; with a real deployed contract it's a live tx)
- 🔑 An API key (`vsk_live_…`) is generated below — click the copy icon to copy it

A toast slides in: _"Transaction confirmed — API key generated and ready to use."_

#### Step 7 — Start over

Click **New task** in the header to reset the workspace and try a different prompt. Past tasks appear in the left sidebar's **History** list.

### 🔧 Going deeper — running real on-chain transactions

The demo works without any on-chain setup, but to land the full Monad narrative, deploy the contract:

```bash
# 1. Install Foundry once
curl -L https://foundry.paradigm.xyz | bash && foundryup

# 2. Add your deployer key (server-only, never bundled into the frontend)
echo "OWNER_PRIVATE_KEY=0xYOUR_KEY" >> .env.local

# 3. Deploy + auto-write contract address back to .env.local
./scripts/deploy.sh

# 4. Restart the dev server so the new env vars load
pnpm dev
```

Now `Approve Payment` triggers a **real** `pay(receiver, taskId)` call via wagmi, MetaMask pops up to sign, and the success card links to the live Monad block explorer.

Run the contract test suite:

```bash
cd contracts && forge test -vvv
```

### 🧰 Available commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check (no emit) |
| `./scripts/deploy.sh` | Build + deploy `AgentPay.sol` to Monad Testnet, write address back |
| `cd contracts && forge test` | Run Solidity unit tests |

### 🏗️ Architecture

```
agentpay/
├── app/                         # Next.js App Router
│   ├── page.tsx                 # Landing
│   ├── login/page.tsx           # Sign-in (visual only)
│   ├── dashboard/page.tsx       # Three-column workspace
│   └── providers.tsx            # wagmi + RainbowKit + react-query
├── components/
│   ├── landing/                 # Navbar, Hero, AgentPreview, HowItWorks, WhyMonad, DemoPreview, CTA
│   ├── dashboard/               # Sidebar, ChatInput
│   ├── workflow/                # WorkflowTimeline (the soul of the demo)
│   ├── providers/               # ProviderComparison
│   ├── payment/                 # PaymentApprovalCard, TransactionStatusCard
│   └── ui/                      # Button, Card, Input, Badge, Skeleton, Separator
├── hooks/
│   ├── useWorkflow.ts           # state machine: idle → running → awaiting_approval → paying → success
│   └── usePayment.ts            # writeContract + waitForReceipt, with mock fallback
├── lib/
│   ├── chain.ts                 # Monad Testnet definition
│   ├── wagmi.ts                 # RainbowKit getDefaultConfig
│   ├── contract.ts              # AgentPay ABI + address resolver
│   └── mock/{providers,workflow}.ts
├── stores/useAppStore.ts        # Zustand store
└── contracts/                   # Foundry project: AgentPay.sol + tests + deploy script
```

### 🎨 Design system

Black-and-white minimalism per [`PRD.md` §5](./PRD.md). Geist font, generous radii, glassmorphism-light. All design tokens live in [`app/globals.css`](./app/globals.css).

```
Background  #FFFFFF
Secondary   #F7F7F5
Text        #111111
Subtext     #666666
Border      #E5E5E5
Success     #0EA56B
Warning     #F5A623
```

No neon-purple Web3 chrome, no trading UI, no DeFi dashboards.

### 🔗 Monad constants

| | |
| --- | --- |
| Chain ID | `10143` |
| RPC | `https://testnet-rpc.monad.xyz` |
| Explorer | `https://testnet.monadexplorer.com` |
| Native token | `MON` (18 decimals) |

### 🧪 Mocked vs real

| Layer | Mocked | Real |
| --- | --- | --- |
| Provider marketplace | ✓ (`lib/mock/providers.ts`) | — |
| Agent workflow steps | ✓ (timed reveals) | — |
| Auth | ✓ (form is decorative) | — |
| Wallet connect | — | wagmi + RainbowKit |
| Balance read | — | `useBalance` on Monad Testnet |
| Payment send | optional | `pay(receiver, taskId)` via `useWriteContract`, falls back to mock if no contract address |
| API key issuance | ✓ (`vsk_live_…` placeholder) | — |

This split is deliberate: the on-chain beat carries the Monad narrative; everything else simulates the future without bottlenecking the demo.

---

## License

MIT — see [`PRD.md`](./PRD.md) for product positioning and [`CLAUDE.md`](./CLAUDE.md) for guidance to AI coding agents working in this repo.
