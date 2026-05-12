# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

**This repo currently contains no source code.** It is a planning-only directory: four Markdown docs and a design-reference image folder. Not yet a git repository. The first session that begins implementation will need to `git init`, create `.gitignore`, and scaffold the Next.js application per the structure prescribed in `PRD.md` §10 (`app/`, `components/`, `lib/`, `hooks/`, `stores/`, `types/`, `contracts/`, `public/`, `styles/`).

No build, test, or lint commands exist yet. Once the Next.js scaffold lands, the standard `pnpm dev` / `pnpm build` / `pnpm lint` workflow applies.

## The four source documents

| File | Role | Language |
| --- | --- | --- |
| `PRD.md` | **Authoritative spec** for this repo: pages, components, copy, design tokens, demo script, priorities | 中文 |
| `Product_Plan_en.md` | English product narrative; consult when `PRD.md` is ambiguous | English |
| `Product_Plan.md` | Chinese product narrative; near-duplicate of the EN version | 中文 |
| `study.md` | **Knowledge base from a prior sibling project (AgentVault), NOT documentation of this repo** | 中文 |

### Critical: `study.md` is from a different project

`study.md` is a 1,777-line technical playbook distilled from **AgentVault**, a previous hackathon project. It is *not* a description of this codebase. Use it as a reference for:

- Monad chain constants (see below) — directly reusable
- Deploy script pattern (`study.md` §9) — `forge build` → `forge script --broadcast` → grep address → `sed -i ''` write back to `.env`
- pnpm workspace layout (`study.md` §2) — only relevant if this project later splits into a monorepo
- Session-key / policy-engine contract patterns (`study.md` §3) — **out of scope for AgentPay's MVP**, see below
- Stripe-style design tokens (`study.md` §8) — **does not apply here**, AgentPay uses B&W minimalism (see Design tokens section)

**Do not** cite `contracts/src/AgentVault.sol`, `packages/sdk/`, `@agentvault/sdk`, or any AgentVault MCP tooling as if they exist in this repo. They don't.

## Product positioning (load-bearing for every UI decision)

From `PRD.md` §3 and `Product_Plan_en.md`:

- Position as **AI infrastructure**, never as a crypto wallet, DeFi tool, payment dashboard, or Web3 admin panel.
- Visual references: ChatGPT, Cursor, Linear, Perplexity, Vercel, Raycast. **Anti-references**: K-line charts, neon-purple Web3, trading UI, crypto dashboards.
- Emotional target: *"AI is actively working for the user."* The streaming workflow timeline is the soul of the product (`PRD.md` §7) — non-negotiable.
- 30-second judge comprehension target: the demo must land that fast.

## Tech stack (locked by `PRD.md` §4)

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | TailwindCSS |
| Components | shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | Zustand |
| Forms | React Hook Form |
| Theme | next-themes |
| Wallet | wagmi + RainbowKit |
| Chain | Monad Testnet |
| Smart contract | Solidity |
| AI | OpenAI SDK + Vercel AI SDK (agent flow is mocked) |
| Hosting | Vercel |

## Monad Testnet constants

Reusable across AgentVault → AgentPay; do not re-research.

```
Chain ID:   10143
RPC:        https://testnet-rpc.monad.xyz
Explorer:   https://testnet.monadexplorer.com
Native:     MON (18 decimals)
Test USDC:  0x534b2f3A21130d7a60830c2Df862319e593943A3
Foundry:    curl -L https://foundry.category.xyz | bash && foundryup --network monad
```

## Smart contract scope (`PRD.md` §9)

Intentionally minimal:

```solidity
function pay(address receiver) external payable;
event PaymentCompleted(...);
```

**Do not over-engineer.** No session keys, no policy engine, no audit trail, no x402 — those patterns are documented in `study.md` for the prior project but are explicitly out of scope for AgentPay's hackathon MVP.

## Mock-first guidance (`PRD.md` §8, §16)

- **All non-chain data is mocked**: provider lists, prices, "API key generated" output, agent reasoning steps.
- Do NOT build a real marketplace, real agent orchestration framework, or real API purchase flow.
- Workflow timeline MUST stream step-by-step (typing effect, shimmer, fade-in). This is the demo's hook.
- Wallet connect and on-chain transaction-send are real; everything around them is staged.

## Design tokens (`PRD.md` §5)

Black/white minimalism, large radii, light glassmorphism. Geist (fallback Inter).

```
Background: #FFFFFF
Secondary:  #F7F7F5
Text:       #111111
Subtext:    #666666
Border:     #E5E5E5
Success:    #0EA56B
Warning:    #F5A623
```

**Forbidden**: Web3 neon purple, complex gradients, trading/DeFi chrome, crypto-dashboard density. The Stripe-purple palette in `study.md` §8 belongs to AgentVault and does not apply here.

`images/landing.png` and `images/user.png` are the visual targets — consult them before making layout choices.

## Canonical demo script (`PRD.md` §13)

Validate any UI change against this end-to-end flow:

1. Open landing page.
2. User types: `Buy the cheapest image generation API under 5 USDC`.
3. Workflow timeline streams (Understanding → Searching → Comparing → Selecting → Awaiting approval).
4. Payment panel appears with provider, price, network, gas.
5. User clicks Approve.
6. Monad transaction succeeds; tx hash + explorer link shown.
7. `✓ API Key Generated`.

## Build priorities (`PRD.md` §12)

Work in this order; do not jump ahead:

1. Landing UI, dashboard layout, workflow timeline.
2. Provider cards, payment panel, wallet connect.
3. Monad transaction send, success state.
4. Animation / transition / typography / loading-state polish.

UI fidelity beats backend correctness in every priority decision (`PRD.md` §16).
