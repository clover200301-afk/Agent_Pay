# AgentPay PRD（Product Requirements Document）

## 产品名称

# AgentPay

---

# 产品定位

AgentPay 是一个：

# AI Native Payment Infrastructure

允许 AI Agent：

* 搜索数字服务
* 比较价格
* 请求支付授权
* 执行 Monad 链上支付
* 获取购买结果

目标不是做：

* Crypto Wallet
* DeFi Tool
* 区块链后台

而是：

# “让 AI Agent 获得经济行为能力”

---

# 一、项目目标

---

## Hackathon 目标

构建一个：

# 可 Demo 的 AI Agent 支付产品 MVP

要求：

* UI 高级
* Demo 流畅
* 未来感强
* Monad 集成明确
* 30 秒内让评委理解

---

# 核心 Narrative

---

## 当前问题

AI 可以：

* 思考
* 推理
* 编程

但不能：

* 支付
* 购买服务
* 自动订阅
* 完成经济行为

互联网是为人类设计的。

不是为 AI Agent 设计的。

---

## AgentPay 愿景

AgentPay 让 AI Agent：

* 自主发现服务
* 比较价格
* 完成支付
* 获取资源

从而形成：

# Agentic Commerce

---

# 二、产品结构

---

# 页面结构

```txt
/
├── Landing Page
├── Login Page
├── App Dashboard
└── Payment Flow
```

---

# 三、设计原则（必须严格遵守）

---

# 核心原则

---

## Principle 1

不要像：

```txt
Crypto Dashboard
```

而要像：

```txt
ChatGPT + Cursor
```

---

## Principle 2

不要强调：

```txt
Wallet
```

而强调：

```txt
Agent Approval
```

---

## Principle 3

不要展示：

```txt
Blockchain Complexity
```

而展示：

```txt
AI Autonomous Action
```

---

# 四、技术栈要求

---

# Frontend

| 技术         | 要求                    |
| ---------- | --------------------- |
| Framework  | Next.js 15 App Router |
| Language   | TypeScript            |
| Styling    | TailwindCSS           |
| Components | shadcn/ui             |
| Animation  | Framer Motion         |
| Icons      | Lucide React          |
| State      | Zustand               |
| Forms      | React Hook Form       |
| Theme      | next-themes           |

---

# Web3

| 功能        | 技术            |
| --------- | ------------- |
| Wallet    | wagmi         |
| Wallet UI | RainbowKit    |
| Chain     | Monad Testnet |
| Contract  | Solidity      |
| RPC       | Monad RPC     |

---

# AI

| 功能         | 技术                       |
| ---------- | ------------------------ |
| AI SDK     | OpenAI SDK               |
| Streaming  | Vercel AI SDK            |
| Agent Flow | Mock workflow simulation |

---

# Deployment

| 功能        | 技术               |
| --------- | ---------------- |
| Hosting   | Vercel           |
| Analytics | Vercel Analytics |
| DB（可选）    | Supabase         |

---

# 五、UI/UX 系统

---

# 视觉风格

---

## 必须：

* 极简
* 黑白
* 高级留白
* AI Future UI
* Streaming 感
* 轻玻璃拟态
* 大圆角

---

## 禁止：

* Web3 紫色霓虹
* 复杂渐变
* Trading UI
* DeFi 风格
* K线图
* Crypto Dashboard

---

# 配色

```txt
Background: #FFFFFF
Secondary: #F7F7F5
Text: #111111
Subtext: #666666
Border: #E5E5E5
Success: #0EA56B
Warning: #F5A623
```

---

# 字体

```txt
Primary: Geist
Fallback: Inter
```

---

# 六、页面需求

---

# 1. Landing Page

---

## 目标

让用户：

# 5 秒理解产品

---

## Sections

```txt
Navbar
Hero
How It Works
Demo Preview
Why Monad
CTA Footer
```

---

# Hero Section

---

## 左侧

Headline：

```txt
AI Agents That Can Pay
```

Subheadline：

```txt
Autonomous AI agents that discover,
compare, and purchase digital services using Monad.
```

CTA：

```txt
[ Start Agent ]
[ View Demo ]
```

---

## 右侧

动态 Agent Workflow：

```txt
✓ Understanding task
✓ Searching providers
✓ Comparing prices
✓ Selecting provider
→ Awaiting approval
```

要求：

* streaming animation
* typing effect
* shimmer loading

---

# 2. Login Page

---

# 布局

```txt
Left Hero
Center Login Form
Right Workflow Preview
```

---

## 登录方式

支持：

```txt
Connect Wallet
Email Login（mock）
```

---

# 3. App Dashboard（核心）

---

# 布局

```txt
| Sidebar | Main Workflow | Payment Panel |
```

---

# Sidebar

---

## 功能

### New Task Button

顶部。

---

### Task History

展示历史任务。

例如：

```txt
Buy cheapest GPT API
Renew AI subscription
Purchase image credits
```

---

### Wallet Section

展示：

```txt
Wallet Address
Monad Network
Balance
```

---

# Main Workflow Area

---

# 输入框

---

## UI

超大输入框：

```txt
What would you like your agent to do?
```

---

## 示例 Prompt

```txt
Buy cheapest image generation API
Purchase GPT API credits
Find translation API under 5 USDC
```

---

# Workflow Timeline（最重要）

---

## 必须实现 Streaming

步骤：

```txt
Understanding request
Searching providers
Comparing pricing
Evaluating reliability
Selecting provider
Preparing transaction
Awaiting approval
```

---

## 状态

### pending

灰色 loading

---

### processing

animated shimmer

---

### success

绿色 check

---

# Provider Comparison

---

## Card Fields

```txt
Provider Name
Price
Uptime
Rating
```

---

## 默认 Provider

```txt
VisionAPI
ImageForge
PixelMind
```

---

## Selected 状态

高亮边框：

```txt
border-black
```

---

# Payment Panel

---

## Card

展示：

```txt
Service
Price
Network
Gas Fee
```

---

## 按钮

```txt
Approve Payment
Reject
```

---

## 点击 Approve 后

流程：

```txt
Loading
→ Pending
→ Success
```

---

# Transaction Success

---

## 展示

```txt
✓ Transaction Confirmed
```

下面：

```txt
Tx Hash
View Explorer
API Key Generated
```

---

# 七、动画需求（非常重要）

---

# 必须实现

---

## 1. Workflow Streaming

逐步显示 workflow。

不要一次性出现。

---

## 2. Smooth Fade

所有组件：

```txt
opacity + translateY
```

---

## 3. Hover Motion

卡片：

```txt
translateY(-2px)
```

---

## 4. Button Animation

hover：

* scale 1.01
* shadow increase

---

## 5. Skeleton Loading

provider cards loading。

---

# 八、业务逻辑

---

# Agent Workflow（Mock）

---

## 用户输入

例如：

```txt
Buy cheapest image generation API under 5 USDC
```

---

## 系统流程

```txt
Task Analysis
→ Provider Search
→ Compare Pricing
→ Select Provider
→ Request Approval
→ Wallet Signature
→ Monad Transaction
→ Return API Key
```

---

# 注意

当前：

# 全部允许 Mock

无需：

* 真 Marketplace
* 真 Agent Framework
* 真 API Purchase

---

# 九、Monad 集成要求

---

# 必须展示：

```txt
Monad Testnet
```

---

# 必须实现：

* Wallet Connect
* Transaction Send
* Transaction Hash

---

# Smart Contract

---

## 功能极简

只实现：

```solidity
pay(address receiver)
```

以及：

```solidity
emit PaymentCompleted(...)
```

---

# 十、推荐项目结构

```txt
agentpay/
├── app/
│   ├── (landing)/
│   ├── dashboard/
│   ├── login/
│   └── api/
│
├── components/
│   ├── landing/
│   ├── dashboard/
│   ├── workflow/
│   ├── payment/
│   ├── animations/
│   └── shared/
│
├── lib/
├── hooks/
├── stores/
├── types/
├── contracts/
├── public/
└── styles/
```

---

# 十一、组件需求

---

# Landing

```txt
HeroSection
WorkflowPreview
HowItWorks
MonadSection
CTASection
```

---

# Dashboard

```txt
Sidebar
ChatInput
WorkflowTimeline
ProviderComparison
PaymentPanel
TransactionStatus
```

---

# 十二、开发优先级

---

# Priority 1

必须先完成：

* Landing UI
* Dashboard Layout
* Workflow Timeline

---

# Priority 2

完成：

* Provider Cards
* Payment Panel
* Wallet Connect

---

# Priority 3

完成：

* Monad Transaction
* Success State

---

# Priority 4

最后优化：

* animations
* transitions
* typography
* loading states

---

# 十三、Demo Script（重要）

---

# Demo Flow

---

## Step 1

打开 Landing Page。

---

## Step 2

输入：

```txt
Buy cheapest image generation API under 5 USDC
```

---

## Step 3

Workflow 开始 streaming。

---

## Step 4

出现：

```txt
Approve Payment
```

---

## Step 5

点击 Approve。

---

## Step 6

Monad Transaction Success。

---

## Step 7

展示：

```txt
✓ API Key Generated
```

---

# 十四、评委感知目标

---

# 用户应该觉得：

```txt
“AI 正在替我执行真实经济行为”
```

而不是：

```txt
“这是一个 Crypto 产品”
```

---

# 十五、最终产品关键词

---

# AgentPay =

```txt
ChatGPT
+
Cursor Agent
+
Apple Pay
+
Monad
```

---

# 十六、Claude 开发要求（非常重要）

---

# Claude 必须：

---

## 1. 优先 UI 完成度

Hackathon 中：

# UI > 后端复杂度

---

## 2. 所有数据允许 Mock

重点：

```txt
未来感体验
```

而不是：

```txt
真实商业逻辑
```

---

## 3. 强调 Streaming UX

这是产品灵魂。

---

## 4. 所有交互必须丝滑

包括：

* hover
* transitions
* fade
* loading
* typing

---

# 十七、最终目标

---

# 30 秒内：

让评委理解：

```txt
AI Agent 可以自主完成支付行为
```

并且：

# Monad 是 AI-native Payments 的最佳基础设施。
