# AgentPay

> **人类用 App，AI Agent 用 AgentPay。**

🌐 [English](./README.md) · [中文](#中文)

AgentPay 是为 Monad 黑客松打造的 AI-native 支付基础设施 Demo。AI Agent 自主搜索数字服务提供商、比较价格、请求用户授权，最后在 Monad 链上完成结算——全流程不超过 30 秒。

产品需求、设计 tokens、Demo 流程详见 [`PRD.md`](./PRD.md)，视觉设计稿在 [`images/`](./images/)。

---

## 中文

### ⚡ 5 分钟快速上手

不需要钱包、不需要部署合约、不需要任何 API key。Demo 默认以"模拟交易"模式运行，开箱即用。

```bash
# 1. 安装依赖
pnpm install

# 2. 创建本地环境变量文件（Demo 模式下随便填都行）
cp .env.example .env.local

# 3. 启动开发服务器
pnpm dev
```

打开浏览器访问 [`http://localhost:3000`](http://localhost:3000)，就这么简单。你会看到 landing 页，点右上角 **Start Agent** 进入工作台。

> **没有装 pnpm？** 一次性安装：`npm install -g pnpm`。

### 🎬 新手教程 —— 你的第一次 Agent 任务

按照下面这个 30 秒导览走一遍，你就能体验 AgentPay 所有核心功能。

#### 第 1 步 —— Landing 页

访问 [`http://localhost:3000`](http://localhost:3000)。Hero 区域有一个实时循环的 Agent 工作流预览，演示的就是你接下来要做的事。点击右上角的 **Start Agent**。

#### 第 2 步 —— 登录

进入 `/login` 页面。有三种方式进入工作台：

| 方式 | 行为 |
| --- | --- |
| 点击 **Sign in** 按钮 | Demo 模式 —— 邮箱/密码输入框只是装饰 |
| 点击 **Connect Wallet** | 弹出 RainbowKit；选 MetaMask 或任何注入式钱包（切到 **Monad Testnet**）|
| 点击 **Continue as guest** | 跳过钱包，直接进工作台 |

第一次跑就点 **Sign in** 即可。

#### 第 3 步 —— 描述任务

进入 `/dashboard` 后，中间的大输入框问你 _"What would you like your agent to do?"_（你希望 Agent 做什么？）

可以点击下面的示例 prompt 标签，也可以自己输入。最经典的演示 prompt 是：

```
Buy the cheapest image generation API under 5 USDC
```
（用 5 USDC 以内的最便宜价格买一个图像生成 API）

按 **回车** 或点向上箭头按钮，Agent 启动。

#### 第 4 步 —— 观看流式工作流

Agent 会在大约 5 秒内依次执行 7 个可见步骤：

1. Understanding request（理解请求）
2. Searching providers（搜索服务商）
3. Comparing pricing（比较价格）
4. Evaluating reliability（评估可靠性）
5. Selecting provider（选择服务商）
6. Preparing transaction（准备交易）
7. **Awaiting approval（等待授权）** ← 在这里暂停

每一步都带 shimmer 动效一个个亮起来。下方会淡入三个服务商卡片（VisionAPI、ImageForge、PixelMind），最便宜的（VisionAPI，3.2 USDC）会被高亮标记为 **Selected**。

#### 第 5 步 —— 授权支付

看右侧栏。**Payment Approval**（支付审批）卡片已经滑入，显示：
- Service（服务）：VisionAPI
- Price（价格）：3.20 USDC
- Network（网络）：Monad Testnet
- Gas fee：约 0.0001 MON

点击 **Approve Payment**（授权支付）。

#### 第 6 步 —— 查看结算结果

卡片切换到 **Transaction** 状态。2 秒的确认动画后：
- ✅ 出现 Tx hash（点右边的外链图标可以打开 Monad Explorer。Mock 模式下是模拟 hash；部署了真实合约就是真实交易）
- 🔑 下方生成 API key（`vsk_live_…`），点复制图标可以复制

右下角弹出 toast 提示："Transaction confirmed — API key generated and ready to use."

#### 第 7 步 —— 开启下一次任务

点 header 的 **New task** 按钮重置工作台，换一个 prompt 再试一次。所有历史任务都会出现在左侧栏的 **History** 列表里。

### 🔧 进阶用法 —— 跑真实链上交易

Demo 不需要任何链上配置也能跑通完整流程，但要呈现完整的 Monad 链上叙事，建议部署一下合约：

```bash
# 1. 安装 Foundry（一次性）
curl -L https://foundry.paradigm.xyz | bash && foundryup

# 2. 添加部署私钥（仅服务端使用，不会进前端 bundle）
echo "OWNER_PRIVATE_KEY=0xYOUR_KEY" >> .env.local

# 3. 部署 + 自动把合约地址写回 .env.local
./scripts/deploy.sh

# 4. 重启 dev 服务器加载新的环境变量
pnpm dev
```

部署完之后，**Approve Payment** 按钮会通过 wagmi 触发真实的 `pay(receiver, taskId)` 合约调用，MetaMask 会弹出签名窗口，成功后的卡片会跳到 Monad Testnet 浏览器的真实交易页面。

跑合约测试套件：

```bash
cd contracts && forge test -vvv
```

### 🧰 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动 Next.js 开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm typecheck` | TypeScript 类型检查（不输出文件） |
| `./scripts/deploy.sh` | 编译并部署 `AgentPay.sol` 到 Monad Testnet，自动写回地址 |
| `cd contracts && forge test` | 跑 Solidity 单元测试 |

### 🏗️ 项目结构

```
agentpay/
├── app/                         # Next.js App Router 路由
│   ├── page.tsx                 # Landing 页
│   ├── login/page.tsx           # 登录页（纯视觉）
│   ├── dashboard/page.tsx       # 三栏工作台
│   └── providers.tsx            # wagmi + RainbowKit + react-query 注入
├── components/
│   ├── landing/                 # Navbar、Hero、AgentPreview、HowItWorks、WhyMonad、DemoPreview、CTA
│   ├── dashboard/               # Sidebar、ChatInput
│   ├── workflow/                # WorkflowTimeline（Demo 的灵魂）
│   ├── providers/               # ProviderComparison
│   ├── payment/                 # PaymentApprovalCard、TransactionStatusCard
│   └── ui/                      # Button、Card、Input、Badge、Skeleton、Separator
├── hooks/
│   ├── useWorkflow.ts           # 状态机：idle → running → awaiting_approval → paying → success
│   └── usePayment.ts            # writeContract + waitForReceipt，带 mock 兜底
├── lib/
│   ├── chain.ts                 # Monad Testnet 定义
│   ├── wagmi.ts                 # RainbowKit getDefaultConfig
│   ├── contract.ts              # AgentPay ABI + 地址解析
│   └── mock/{providers,workflow}.ts
├── stores/useAppStore.ts        # Zustand 全局状态
└── contracts/                   # Foundry 项目：AgentPay.sol + 测试 + 部署脚本
```

### 🎨 设计系统

按 [`PRD.md` §5](./PRD.md) 要求，黑白极简风。Geist 字体、大圆角、轻玻璃拟态。所有设计 token 都在 [`app/globals.css`](./app/globals.css)。

```
Background  #FFFFFF（背景）
Secondary   #F7F7F5（次要背景）
Text        #111111（正文）
Subtext     #666666（弱化文字）
Border      #E5E5E5（边框）
Success     #0EA56B（成功态）
Warning     #F5A623（警告态）
```

**严格禁用**：Web3 霓虹紫、K 线图、Trading UI、DeFi Dashboard 风格。

### 🔗 Monad 链常量

| | |
| --- | --- |
| Chain ID | `10143` |
| RPC | `https://testnet-rpc.monad.xyz` |
| 浏览器 | `https://testnet.monadexplorer.com` |
| 原生代币 | `MON`（18 位小数）|

### 🧪 Mock vs 真实

| 模块 | Mock | 真实 |
| --- | --- | --- |
| 服务商市场 | ✓（`lib/mock/providers.ts`）| — |
| Agent 工作流步骤 | ✓（定时展开）| — |
| 登录认证 | ✓（表单是装饰）| — |
| 钱包连接 | — | wagmi + RainbowKit |
| 余额读取 | — | `useBalance` 实时读 Monad Testnet |
| 支付发送 | 可选 | 通过 `useWriteContract` 调 `pay(receiver, taskId)`；没填合约地址自动降级为 mock |
| API key 颁发 | ✓（`vsk_live_…` 占位）| — |

这种"分层 mock"是刻意的：**链上结算**承担 Monad 叙事，其他部分模拟未来形态，避免把 Demo 卡在真实集成上。

### ❓ 常见问题

**Q: 第一次跑 `pnpm dev` 报错怎么办？**
A: 先确认 Node.js ≥ 18，再确认 pnpm 安装成功（`pnpm -v` 看版本）。如果 `pnpm install` 报错，删 `node_modules` 和 `pnpm-lock.yaml` 重装。

**Q: Wallet 连接弹窗不出来？**
A: 需要在 [WalletConnect Cloud](https://cloud.walletconnect.com) 申请一个 Project ID，填到 `.env.local` 的 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 里。Demo 模式不需要钱包也能跑完整流程。

**Q: MetaMask 找不到 Monad Testnet？**
A: 手动添加网络，参数见上方 [Monad 链常量](#-monad-链常量)。原生代币 MON 可以从 Monad 官方水龙头领。

**Q: 不部署合约也能完整 Demo 吗？**
A: 完全可以。`usePayment` hook 检测到没有合约地址会自动走 mock 路径——生成假 hash + 2.2 秒确认动画，UI 体验和真实交易完全一致。

---

## License

MIT —— 产品定位见 [`PRD.md`](./PRD.md)，AI 协作开发须知见 [`CLAUDE.md`](./CLAUDE.md)。
