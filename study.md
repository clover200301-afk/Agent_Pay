# AgentVault 项目沉淀 (study.md)

> **用途**：下一次同系列 Web3 / Agentic Payment Hackathon 的认知冷启动手册。
> **读者**：未来的我 + AI 协作 agent（Claude Code / Cursor / Windsurf）。
> **风格**：中文叙述 + 英文术语 + 关键代码片段（可直接复制）。
>
> 本文档覆盖：合约设计模式 / SDK 架构 / x402 协议实战 / MCP 工具集 / 三段式风险分区业务模型 / Stripe 风格 design system / 一键部署 / 测试策略 / 踩过的坑。

## 目录

1. [项目速览与赛题映射](#1-项目速览与赛题映射)
2. [整体架构沉淀](#2-整体架构沉淀)
3. [智能合约设计模式（核心算法层）](#3-智能合约设计模式核心算法层)
4. [SDK 设计模式（TypeScript 层）](#4-sdk-设计模式typescript-层)
5. [x402 协议实战（机器支付层）](#5-x402-协议实战机器支付层)
6. [MCP Server 工具集设计](#6-mcp-server-工具集设计)
7. [三段式风险分区业务模型（产品 idea 层）](#7-三段式风险分区业务模型产品-idea-层)
8. [Stripe 风格 Design System 沉淀](#8-stripe-风格-design-system-沉淀)
9. [一键部署 / 一键启动脚本沉淀](#9-一键部署--一键启动脚本沉淀)
10. [测试策略](#10-测试策略)
11. [踩过的坑 + 下次直接绕过的提醒](#11-踩过的坑--下次直接绕过的提醒)
12. [关键复用引用清单](#12-关键复用引用清单)

---

## 1. 项目速览与赛题映射

> **本章解决什么**：用一页纸交代项目是什么、命中了赛题哪些维度。下次面对类似 agentic-payment 赛题时，可直接对照这张表填坑。

### 1.1 一句话定位

> **AgentVault**：让 AI Agent 在用户授权额度内自主进行链上支付的非托管钱包系统。
> 核心是 **Smart Contract Wallet + Session Key + Policy Engine + Audit Trail + x402** 五件套。

### 1.2 技术栈一览

| 层 | 技术 |
|---|---|
| 智能合约 | Solidity 0.8.28 + Foundry + OpenZeppelin ReentrancyGuard |
| 链 | Monad Testnet (Chain ID `10143`, RPC `https://testnet-rpc.monad.xyz`) |
| 链交互 | viem (TypeScript-native，比 ethers 更轻) |
| AI Agent 接入 | `@modelcontextprotocol/sdk` (MCP stdio) |
| 机器支付 | `@x402/fetch` + `@x402/evm` (HTTP 402 / EIP-3009) |
| 前端 | Next.js 14 App Router + Tailwind |
| 商家 server | Express + YAML 价格表 |
| 持久化 | better-sqlite3 (审计) + YAML (策略) + AES-256-GCM (keystore) |
| 包管理 | pnpm workspace（monorepo） |

### 1.3 黑客松评审 5 项要求 → 实现位置 对照表

> 这是赛题的"应试模板"，下次拿到任何 agentic 赛题先对照填表。

| # | 评审要求 | AgentVault 的实现 | 文件位置 |
|---|---|---|---|
| 1 | **去中心化 / 非托管** | 用户私钥本地 AES-256-GCM 加密存储；Agent 只持有受限 Session Key；合约开源 | `contracts/src/AgentVault.sol`, `packages/sdk/src/wallet.ts` |
| 2 | **安全配置** | 链上：单笔/每日限额 + 白名单 + 有效期 + token 锁定 + 紧急暂停。链下：Policy Engine 分类限制 + 阈值审批 | `AgentVault.sol:217-277`, `packages/sdk/src/policy-engine.ts` |
| 3 | **Agent 原生** | 12 个 MCP Tools + 3 个 Resources，Claude Code / Cursor / Windsurf 通用 stdio | `packages/mcp-server/src/` |
| 4 | **可审计可解释** | 每笔支付落 SQLite，18 个字段含 agentId / taskContext / policyHits / riskLevel | `packages/sdk/src/audit.ts` |
| 5 | **恢复与权限管理** | Session Key 撤销 / 轮换 / 多 agent 差异化权限 / emergency pause | `AgentVault.sol:151-186` |

### 1.4 加分项命中

| 加分项 | 命中方式 |
|---|---|
| A: Session Key | ✅ 链上 8 维度限制 + 链下管理 |
| B: Policy Engine | ✅ YAML 配置 + 三态决策 (approve / require_confirmation / reject) |
| D: x402/MPP 机器支付 | ✅ probe + payAndFetch 双阶段，原生和 ERC-20 双路径 |
| E: 人机协同 | ✅ MCP `confirmed` 参数二次确认 + 三段式风险分区 |
| F: 审计日志 | ✅ 结构化 SQLite + getSpendingSummary 聚合 |

### 1.5 下次套用 checklist

- [ ] 一句话定位先写出来（不超过 25 字），把"非托管 / 受限 / 可审计"这三个 selling point 锁进去
- [ ] 把赛题"必须满足项"列表抓出来，做成 5 行对照表，逐项指向源码位置
- [ ] 把"加分项"全部命中再说创新（不要先做创新再补必选项）
- [ ] 技术栈一律选 viem 而非 ethers（更轻 + TypeScript first）
- [ ] 链选 Monad / 任何 EVM 兼容 L1 都 OK，但 RPC 和 chain ID 要写进 constants 复用

---

## 2. 整体架构沉淀

> **本章解决什么**：搞清楚为什么要 monorepo + 怎么切分包。下次起新项目时，目录骨架可以直接复制本仓库。

### 2.1 三层架构图

```
                    ┌──────────────────────────────┐
                    │   AI Agent (Claude Code)     │
                    └──────────┬───────────────────┘
                               │ MCP (stdio)
                               ▼
┌──────────┐    ┌─────────────────────────────┐    ┌──────────────┐
│ Dashboard │    │       MCP Server            │    │  Merchant    │
│ (Next.js) │    │  12 tools + 3 resources     │    │  Server      │
│ :3000     │    │  Policy Engine + Audit Log  │    │  (x402)      │
└─────┬─────┘    └──────────┬──────────────────┘    │  :4020       │
      │                     │                       └──────┬───────┘
      │          ┌──────────▼──────────┐                   │
      └──────────►    @agentvault/sdk  ◄───────────────────┘
                 │  Wallet + SessionKey │
                 │  Transaction Builder │
                 └──────────┬──────────┘
                            │ JSON-RPC
                            ▼
                 ┌──────────────────────┐
                 │   Monad Blockchain   │
                 │   AgentVault.sol     │
                 └──────────────────────┘
```

**关键设计原则**：
- **SDK 是单一真相源**（single source of truth）。任何与"链 / 私钥 / 策略 / 审计"打交道的逻辑都只能写在 `packages/sdk/`，不能在 mcp-server / frontend / merchant-server 重复。
- **MCP Server / Frontend / Merchant Server 都是 SDK 的 thin wrapper**。这样换 MCP 框架（如换成 LangChain 或 OpenAI tools）只需改 wrapper，不动核心。

### 2.2 monorepo 切分

```
agentvault/
├── contracts/                    # Foundry 工程，独立编译
│   ├── src/AgentVault.sol
│   ├── test/AgentVault.t.sol
│   └── script/Deploy.s.sol
│
├── packages/                     # pnpm workspace
│   ├── sdk/                      # @agentvault/sdk —— 核心
│   ├── mcp-server/               # 依赖 sdk
│   ├── frontend/                 # 依赖 sdk (Next.js)
│   └── merchant-server/          # 不依赖 sdk（卖方独立部署，避免买方私钥泄漏）
│
├── demo/                         # 端到端验证脚本
│   ├── e2e-demo.ts               # 链上 e2e
│   └── local-test.ts             # 13 项无链验证（评委零配置可跑）
│
├── scripts/
│   ├── deploy.sh                 # 一键部署 + 自动写回 .env
│   └── start-all.sh              # 一键启动 dashboard + merchant + mcp
│
├── docs/                         # 设计文档
├── .env.example
├── package.json                  # workspaces root
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

### 2.3 pnpm workspace 配置要点

`pnpm-workspace.yaml`：

```yaml
packages:
  - "packages/*"
```

`package.json` 根目录的 scripts 把所有子包的 build / test 串起来：

```json
{
  "scripts": {
    "build": "pnpm -r build",
    "test:sdk": "pnpm --filter @agentvault/sdk test",
    "dev:frontend": "pnpm --filter @agentvault/frontend dev",
    "dev:merchant": "pnpm --filter @agentvault/merchant-server dev"
  }
}
```

**关键技巧**：
- 子包之间的引用走 `workspace:*` 协议（`"@agentvault/sdk": "workspace:*"`），pnpm 自动 symlink，不会去 npm 拉。
- 共享 tsconfig：根目录 `tsconfig.base.json`，子包 extends 它。
- SDK 编译产物放 `packages/sdk/dist/`，并在 `package.json` 里写 `"main": "./dist/index.js"` + `"types": "./dist/index.d.ts"`。
- ABI 文件单独放 `packages/sdk/src/abi/AgentVault.json`，运行时用 `fileURLToPath(import.meta.url)` 读 —— 避免 bundler 处理 JSON。

### 2.4 下次套用 checklist

- [ ] monorepo 一定上 pnpm workspace（不要用 yarn / npm workspaces，pnpm 软链最干净）
- [ ] 把 SDK 单独切出来作为 single source of truth
- [ ] Merchant / 第三方组件不要依赖 SDK（买方和卖方私钥隔离）
- [ ] 每个子包都要 export 类型，让 wrapper 包写得没心智负担
- [ ] `tsconfig.base.json` 统一 module resolution，子包 extends 即可
- [ ] 部署脚本和 demo 脚本放 monorepo 根目录的 `scripts/` 和 `demo/`，方便评委跑

---

## 3. 智能合约设计模式（核心算法层）

> **本章解决什么**：把 `AgentVault.sol` 里所有可以脱离本项目复用的设计模式抽出来，下次写任何 "受限委托执行" 的合约都能直接套。

### 3.1 Session Key 数据结构（8 维压缩）

把所有限制压在一个 `struct` 里，字段顺序按 storage slot 优化：

```solidity
struct SessionConfig {
    uint48 validAfter;      // slot 0 (打包)
    uint48 validUntil;      // slot 0
    uint256 maxPerTx;       // slot 1
    uint256 maxDaily;       // slot 2
    uint256 dailySpent;     // slot 3
    uint48 lastResetDay;    // slot 4 (打包)
    bool active;            // slot 4
    address allowedToken;   // slot 4 (20 bytes 还能塞)
}
```

**复用价值**：任何"按时间 + 按金额 + 按目标"三维度限制的委托都用这个结构。`uint48` 装 timestamp 完全够用（截止 ~ 2^48 / 365 / 86400 ≈ 893 万年），多个 `uint48` 打包同 slot 省 gas。

### 3.2 `_extractSpendAmount` —— 同一份限额逻辑同时管原生 + ERC-20

> **这是最值得抄的一段**。问题：execute 收到的 calldata 是不透明的，怎么知道这笔交易"花了多少钱"？答：解析 ERC-20 selector 反推。

```solidity
bytes4 private constant TRANSFER_SELECTOR = 0xa9059cbb; // transfer(address,uint256)
bytes4 private constant APPROVE_SELECTOR = 0x095ea7b3;  // approve(address,uint256)
bytes4 private constant TRANSFER_FROM_SELECTOR = 0x23b872dd; // transferFrom

function _extractSpendAmount(uint256 value, bytes calldata data)
    internal pure returns (uint256)
{
    uint256 tokenAmount = 0;
    if (data.length >= 68) {
        bytes4 selector = bytes4(data[:4]);
        if (selector == TRANSFER_SELECTOR || selector == APPROVE_SELECTOR) {
            (, tokenAmount) = abi.decode(data[4:68], (address, uint256));
        } else if (selector == TRANSFER_FROM_SELECTOR && data.length >= 100) {
            (,, tokenAmount) = abi.decode(data[4:100], (address, address, uint256));
        }
    }
    return value > tokenAmount ? value : tokenAmount;
}
```

**核心思想**：把"native value" 和"ERC-20 amount"用 `max()` 统一为一个标量，限额检查就只需要一份代码。
**踩坑提醒**：`data.length` 检查必须严格（transfer/approve 至少 68 字节，transferFrom 至少 100 字节），否则 `abi.decode` 会 revert 但拒绝信息不友好；也防止恶意短 calldata 绕过限额。

### 3.3 每日预算的 lazy reset（无需 cron）

```solidity
uint48 today = uint48(block.timestamp / 1 days);
if (session.lastResetDay < today) {
    session.dailySpent = 0;
    session.lastResetDay = today;
}
```

**核心思想**：不要做定时任务来重置计数，而是在每次"用"之前 lazy 检查"是否新一天"。view 函数里也用同样的逻辑兜底（避免显示昨天的过期数据）：

```solidity
function remainingDailyBudget(address key) external view returns (uint256) {
    SessionConfig storage s = _sessions[key];
    uint256 spent = s.dailySpent;
    if (s.lastResetDay < uint48(block.timestamp / 1 days)) {
        spent = 0;
    }
    return s.maxDaily > spent ? s.maxDaily - spent : 0;
}
```

**复用价值**：任何"周期性配额"（每日 / 每周 / 每月）都用这个 lazy reset 模式，不依赖任何 oracle / keeper / cron。

### 3.4 Native-only vs Token-locked 的二选一约束

```solidity
address allowedToken = session.allowedToken;
if (allowedToken == address(0)) {
    // Native-only session: value 必须 > 0，禁止 calldata（防止意外调合约）
    if (data.length > 0) revert TokenNotAllowed();
} else {
    // Token-locked session: to 必须是这个 token 合约
    if (to != allowedToken) revert TokenNotAllowed();
}
```

**核心思想**：把"这个 session 只能花某个 token"这个约束做成 hard constraint。Native (`address(0)`) 时禁止任何 calldata —— 防止 agent 拿着 native session 去调任何合约（即使白名单允许）造成权限提升。

### 3.5 完整 9 步 execute 检查清单

`execute()` 函数的 9 步检查，可以原封不动复制到下次的合约里：

```
1. session.active                                         → SessionNotActive
2. block.timestamp >= validAfter                          → SessionNotYetValid
3. block.timestamp <= validUntil                          → SessionExpired
4. (有白名单时) to ∈ allowedTargets                        → TargetNotAllowed
5. token 约束                                             → TokenNotAllowed
   - allowedToken == 0 → data.length == 0
   - allowedToken != 0 → to == allowedToken
6. spendAmount = max(value, parsedTokenAmount)
   spendAmount <= maxPerTx                                → ExceedsPerTxLimit
7. lastResetDay < today → dailySpent = 0
8. dailySpent + spendAmount <= maxDaily                   → ExceedsDailyLimit
9. dailySpent += spendAmount; 执行 to.call{value}(data)   → ExecutionFailed
```

**复用价值**：把这 9 步打印出来贴在墙上，下次写"受限执行"合约时逐项打勾。`nonReentrant + whenNotPaused` 是 modifier，不算 9 步内。

### 3.6 三层信任模型

```
Full trust (代码即法律)：    AgentVault.sol 的限额 / 白名单 / 时间窗
Partial trust (可绕过但有用)： 链下 Policy Engine 的分类 / 阈值审批
Zero trust (任何动作都怀疑)：  Agent 本身（合约阻止违规）
```

**核心思想**：链下 Policy 是 UX 层（提前拦截 + 提示用户），链上才是 last line of defense。**永远不要把"链下没过 policy"当成安全保证**，agent 完全可以绕过 MCP server 直接发交易；真正的限制必须在合约里。

### 3.7 紧急暂停 + ReentrancyGuard 双保险

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgentVault is ReentrancyGuard {
    bool public paused;

    modifier whenNotPaused() {
        if (paused) revert IsPaused();
        _;
    }

    function execute(...) external whenNotPaused nonReentrant returns (bytes memory) { ... }

    function pause() external onlyOwner { paused = true; emit Paused(msg.sender); }
    function unpause() external onlyOwner { paused = false; emit Unpaused(msg.sender); }
}
```

**复用价值**：任何允许"用户外部调用"的合约都加这两个 modifier；`pause` 是 0-day 应急开关，`nonReentrant` 防止 to.call 回调进来再次 execute。

### 3.8 下次套用 checklist

- [ ] 把所有限制塞进一个 `struct`，字段顺序按 slot 优化（`uint48` 集中放）
- [ ] `_extractSpendAmount` 这个工具函数直接抄走
- [ ] 任何周期配额都用 `lastReset = ts / 1 days` 的 lazy reset
- [ ] view 函数也要做 lazy reset 检查（不然 frontend 显示错的）
- [ ] Token 约束做成 hard constraint，不允许"灵活"
- [ ] `execute` 9 步检查顺序固定（先权限 → 后金额 → 最后真正调用）
- [ ] `whenNotPaused + nonReentrant` 必加
- [ ] 自定义 `error` 而非 `require` 字符串（gas 省 + frontend 解析友好）
- [ ] 关键事件全 emit（`SessionKeyAdded` / `Executed` / `Paused`），方便链下 indexing

---

## 4. SDK 设计模式（TypeScript 层）

> **本章解决什么**：`packages/sdk/` 里 6 个模块的设计意图、依赖关系和可复用片段。下次写任何"链下 + 链上"双侧的 Web3 项目都用得上。

### 4.1 模块依赖图

```
        Wallet (核心)
          ▲
          │ inject
          ├─────────── SessionKeyManager
          │                  ▲
          │                  │ inject
          ├─────────── TransactionBuilder
          │
PolicyEngine (独立, 读 ~/.agentvault/policy.yaml)
AuditLogger  (独立, 读 ~/.agentvault/audit.db)
X402Client   (独立, 持有自己的 signerKey)
```

**初始化顺序**（在 `mcp-server/src/index.ts` 和 `frontend/lib/server-state.ts` 都是这个顺序）：

```typescript
const wallet = AgentVaultWallet.fromPrivateKey(privateKey, rpcUrl);
wallet.setVaultAddress(vaultAddress);
const sessionKeyManager = new SessionKeyManager(wallet);
const txBuilder = new TransactionBuilder(wallet, sessionKeyManager);
const policyEngine = new PolicyEngine();    // 读 ~/.agentvault/policy.yaml
const auditLogger = new AuditLogger();      // 读 ~/.agentvault/audit.db
```

**复用价值**：SDK 模块按"有状态 (wallet, session) → 工具 (txBuilder) → 横切关注点 (policy, audit)"分层，依赖只能向上指。下次写 SDK 时严格遵守这个层次，不要让 audit 反过来 import wallet。

### 4.2 AES-256-GCM Keystore（私钥本地加密）

`wallet.ts:88-110` —— 私钥本地存储的工业级方案，**任何需要本地存私钥的 Web3 项目都直接抄**。

```typescript
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

saveEncrypted(password: string, filePath?: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 32);   // KDF: scrypt
  const iv = randomBytes(12);                    // GCM 推荐 12 字节
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const plaintext = JSON.stringify(this.config);
  const ciphertext = cipher.update(plaintext, "utf-8", "hex") + cipher.final("hex");
  const tag = cipher.getAuthTag();              // 认证标签，防篡改

  writeFileSync(path, JSON.stringify({
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    ciphertext,
  }, null, 2));
}

static fromEncryptedFile(password: string, filePath?: string): AgentVaultWallet {
  const data = JSON.parse(readFileSync(path, "utf-8"));
  const key = scryptSync(password, Buffer.from(data.salt, "hex"), 32);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(data.iv, "hex"));
  decipher.setAuthTag(Buffer.from(data.tag, "hex"));
  const decrypted = decipher.update(data.ciphertext, "hex", "utf-8") + decipher.final("utf-8");
  return new AgentVaultWallet(JSON.parse(decrypted));
}
```

**关键点**：
- KDF 用 `scrypt`（不要用裸 SHA-256，弱口令会被暴力破解）
- 算法 `aes-256-gcm`（带认证标签，防篡改；不要用 `aes-256-cbc` —— 不带认证）
- IV 12 字节（GCM 推荐），salt 16 字节
- 4 个字段都 base16 存（hex），单 JSON 文件即可

### 4.3 Session Key 生命周期管理（含隐藏坑）

`session-key.ts:31-86` —— 完整生命周期：generate → on-chain register → fund gas → 等链同步 → 本地缓存。

```typescript
async createSessionKey(config: SessionKeyConfig, opts?: { gasAmount?: bigint }) {
  // 1. 本地生成 keypair（用 viem.generatePrivateKey，密码学安全）
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  // 2. owner 签名上链注册
  const hash = await ownerClient.writeContract({
    address: vaultAddress,
    abi: AGENT_VAULT_ABI,
    functionName: "addSessionKey",
    args: [account.address, validAfter, validUntil, maxPerTx, maxDaily, allowedTargets, allowedToken],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // 3. 给 session key 转 0.1 MON 作 gas（不然 session key 没法发交易）
  const fundHash = await ownerClient.sendTransaction({
    to: account.address,
    value: opts?.gasAmount ?? parseEther("0.1"),
  });
  await publicClient.waitForTransactionReceipt({ hash: fundHash });

  // 4. ⚠️ Monad 的"隐藏坑"：waitForReceipt 之后状态可能还没同步完，
  //    立刻用 session key 调 execute 会失败。sleep 2s 兜底。
  await new Promise((r) => setTimeout(r, 2000));

  // 5. 本地 Map 缓存（注意：私钥只在内存，不持久化；要持久化必须再走 keystore）
  this.sessionKeys.set(account.address, { privateKey, config });
  return { address: account.address, privateKey, config, active: true, ... };
}
```

**踩坑总结**：
- ⚠️ **Monad 状态同步延迟**：`waitForTransactionReceipt` 返回后，立即查询新建账户的 session 状态可能还是旧值。**必须 sleep 2000ms** 兜底。其他 EVM 链（以太坊主网、Arbitrum）一般不需要。
- ⚠️ **Session key 必须 fund gas**：链上限额已经检查过它能花多少了，但 session key 本身要付 gas。0.1 MON 经验值够 ~30 笔。
- ⚠️ **私钥只在内存**：sessionKeys Map 重启丢失。生产场景要单独加密持久化（参考 4.2）。

### 4.4 TransactionBuilder 双路径

`transaction.ts:26-92` —— 把"原生 / ERC-20"两种路径统一到一个 `executePayment(request, sessionKey)`：

```typescript
async executePayment(request: PaymentRequest, sessionKeyAddress: Address) {
  let to: Address;
  let value: bigint;
  let data: Hex;

  if (request.token === ZERO_ADDRESS) {
    // Native: 直接 to.value(amount), data = 0x
    to = request.to;
    value = request.amount;
    data = "0x";
  } else {
    // ERC-20: to = token 合约, value = 0, data = encodeFunctionData("transfer", [to, amount])
    to = request.token;
    value = 0n;
    data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [request.to, request.amount],
    });
  }

  // 都通过 vault.execute() 走，session key 签名
  const txHash = await sessionClient.writeContract({
    address: vaultAddress,
    abi: AGENT_VAULT_ABI,
    functionName: "execute",
    args: [to, value, data],
  });
  ...
}
```

**复用价值**：用 `token === ZERO_ADDRESS` 作为 native 标识，是 EVM 生态共识。SDK 只暴露 `payUSDC()` / `payNative()` 两个语法糖，业务代码不用关心 ABI encoding。

### 4.5 Policy Engine 三态决策

`policy-engine.ts:36-129` —— **三态返回**是关键：不仅是 yes/no，还有"待确认"。

```typescript
export type PolicyDecision =
  | { action: "approve"; reasons: string[] }
  | { action: "require_confirmation"; reasons: string[]; message: string }
  | { action: "reject"; reasons: string[] };

evaluate(request: PaymentRequest): PolicyDecision {
  // 1. requireReason
  if (this.config.risk.requireReason && !request.reason) {
    return { action: "reject", reasons: ["Payment reason is required by policy"] };
  }
  // 2. categories: blocked / allowed
  if (request.category && this.config.categories.blocked.includes(request.category)) {
    return { action: "reject", reasons: [`Category "${request.category}" is blocked`] };
  }
  // 3. recipients: whitelist / blacklist / open
  if (this.config.recipients.mode === "whitelist" && !inList) {
    if (this.config.risk.blockNewRecipients) return { action: "reject", ... };
    needsApproval = true;  // 软策略：未列入白名单 → 要求人工确认
  }
  // 4. 金额阈值
  if (amountHuman > this.config.spending.requireApprovalAbove) {
    needsApproval = true;
  }

  return needsApproval
    ? { action: "require_confirmation", reasons, message: ... }
    : { action: "approve", reasons };
}
```

**复用价值**：
- 三态比二态强大得多。`reject` 给硬策略；`require_confirmation` 给软策略 + 人机协同。
- YAML 文件路径写死在 `~/.agentvault/policy.yaml`，启动时自动 load + 不存在则写 DEFAULT。
- `assessRisk()` 单独抽出来：>3x 阈值 = high；>1x 阈值 = medium；其他 low。这个分级直接落审计日志。

### 4.6 Audit Logger SQLite Schema

`audit.ts:21-48` —— 18 字段 + 3 索引，是审计层的标准模板。

```sql
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  tx_hash TEXT,
  agent_id TEXT NOT NULL,
  session_key_address TEXT NOT NULL,
  recipient TEXT NOT NULL,
  recipient_label TEXT,
  amount TEXT NOT NULL,
  token TEXT NOT NULL,
  token_address TEXT NOT NULL,
  reason TEXT NOT NULL,
  task_context TEXT,
  policy_hits TEXT NOT NULL,        -- JSON array
  human_approval INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'low',
  result TEXT NOT NULL,             -- 'success' | 'rejected' | 'failed'
  failure_reason TEXT,
  category TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_result ON audit_log(result);
CREATE INDEX IF NOT EXISTS idx_audit_agent ON audit_log(agent_id);
```

**复用价值**：
- 审计字段一定要包含：**谁**（agentId, sessionKey）、**做了什么**（recipient, amount, token, reason, taskContext）、**经过了什么策略**（policyHits, riskLevel, humanApproval）、**结果**（result, failureReason, txHash）
- 用 `better-sqlite3`（同步 API，simple）而非 `sqlite3`（异步 callback，复杂）
- `policy_hits` 存 JSON string，查询时 parse —— 比 normalize 成多张表快得多
- 索引选择：timestamp（按时间查）+ result（看失败的）+ agent（多 agent 隔离）
- `getSpendingSummary(days)` 聚合查询：`SUM(CAST(amount AS REAL))` + `GROUP BY recipient` + `LIMIT 10`，前端 dashboard 直接用。

### 4.7 下次套用 checklist

- [ ] SDK 模块依赖严格分层：状态 → 工具 → 横切
- [ ] 私钥落盘必走 AES-256-GCM + scrypt（不要用 CBC，不要用裸 hash）
- [ ] viem 而非 ethers；用 `generatePrivateKey()` 而非 `Math.random`
- [ ] Monad 上做完写操作 sleep 2s（其他链不用）
- [ ] Session key 一定要 fund gas
- [ ] 用 `ZERO_ADDRESS` 标识 native token
- [ ] Policy 三态决策：reject / require_confirmation / approve
- [ ] 审计日志含 18 字段（参考 4.6 schema），用 better-sqlite3 + 3 索引
- [ ] YAML 配置文件放 `~/.agentvault/`（XDG-friendly），不存在则写 DEFAULT

---

## 5. x402 协议实战（机器支付层）

> **本章解决什么**：HTTP 402 是机器支付（M2M）的事实标准。本章把"买方 client"和"卖方 server"两侧能复用的代码全沉淀下来。

### 5.1 x402 概览

```
┌──────────────┐  ① GET /api/x         ┌──────────────────┐
│   Buyer      │ ─────────────────────► │  Merchant Server │
│   (Agent)    │                        │                  │
│              │ ② 402 + accepts[]      │  Paywall         │
│              │ ◄─────────────────────│  middleware      │
│              │                        │                  │
│              │ ③ GET + X-PAYMENT      │                  │
│              │ ─────────────────────► │  Payment         │
│              │                        │  Verifier        │
│              │ ④ 200 + 真实 body       │                  │
│              │ ◄─────────────────────│  Revenue Logger  │
└──────────────┘                        └──────────────────┘
```

**核心理念**：**API 调用与支付在同一个 HTTP 请求语义中完成**。Agent 拿到 402 的支付要求 → 签名 / 上链 → 重发请求带 `X-PAYMENT` header → 卖方验证后返回数据。

### 5.2 买方：probe + payAndFetch 双阶段（关键 UX）

`x402-client.ts:60-118` —— **probe 是关键创新**。先看价格，policy engine 介入，再决定要不要付。

```typescript
async payAndFetch(url: string, options?: RequestInit): Promise<X402PaymentResult> {
  // Step 1: 不带 X-PAYMENT 探测，看是否需要付费
  const probeResp = await fetch(url, options);
  if (probeResp.status !== 402) {
    return { success: probeResp.ok, data: ..., statusCode: probeResp.status };
  }

  // Step 2: 解析 402 body 拿到 accepts[]
  const body = await probeResp.json();
  const accept = body?.accepts?.[0];
  // accept = { scheme: "exact", network: "eip155:10143",
  //            maxAmountRequired: "1000000000000000",  // wei
  //            payTo: "0x...", extra: { name: "MON", decimals: 18 } }

  // Step 3: native vs ERC-20 双路径
  const isNative = !accept.asset || NATIVE_TOKEN_NAMES.has(accept.extra?.name);
  if (isNative) return this.nativePayAndFetch(url, accept, options);
  // 否则走 @x402/fetch（ERC-20 EIP-3009）
  return this.wrappedFetch(url, options).then(...);
}

// 单独的 probe，不付钱，只看价格 —— 给 policy engine 决策用
async probe(url: string, options?: RequestInit): Promise<X402ProbeResult> {
  const response = await fetch(url, options);
  if (response.status !== 402) return { needsPayment: false, statusCode: response.status };
  const body = await response.json();
  const accept = body?.accepts?.[0];
  return {
    needsPayment: true,
    amount: (Number(BigInt(accept.maxAmountRequired)) / 10 ** decimals).toString(),
    recipient: accept.payTo,
    token: accept.extra?.name,
    network: accept.network,
    rawBody: body,
    statusCode: 402,
  };
}
```

**复用价值**：
- `probe()` 让 MCP 工具能在付钱前给 policy 一次审查机会（参考 `payment.ts:158-212` 的流程）
- "native vs ERC-20" 用 `accept.asset` 是否存在 + `extra.name ∈ {MON, ETH, MATIC}` 判断
- 不需要就预先建立 Web3 连接 —— `payAndFetch` 调用时才 lazy 创建 walletClient

### 5.3 买方：Native token 走 sendTransaction + retry（不走 EIP-3009）

`x402-client.ts:121-179` —— **关键坑**：原生 token 没有 EIP-3009（那是 ERC-20 标准），必须自己发 transfer + 把 txHash 塞进 `X-PAYMENT` header 重试。

```typescript
private async nativePayAndFetch(url, accept, options) {
  // 1. 直接 sendTransaction
  const txHash = await walletClient.sendTransaction({
    to: accept.payTo as Address,
    value: BigInt(accept.maxAmountRequired),
    chain,
  });
  await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 30_000 });

  // 2. 把交易凭证塞进 X-PAYMENT (base64 编码)
  const paymentPayload = JSON.stringify({
    txHash,
    payer: account.address,
    amount: accept.maxAmountRequired,
    payTo: accept.payTo,
    network: accept.network,
  });
  retryHeaders.set("X-PAYMENT", Buffer.from(paymentPayload).toString("base64"));

  // 3. 带凭证重发请求
  const retryResp = await fetch(url, { ...options, headers: retryHeaders });
  return { success: retryResp.ok, data: ..., txHash, amountPaid: accept.maxAmountRequired };
}
```

**踩坑提醒**：
- `@x402/fetch` 库默认假设 ERC-20 EIP-3009 流程，原生 token **必须自己实现**这条 fallback 路径。
- `X-PAYMENT` header 用 base64 编码（HTTP header 不能包含未编码的 JSON）。

### 5.4 卖方：Paywall middleware（Express 实现）

`packages/merchant-server/src/middleware/paywall.ts` —— 把任意 Express 路由变成"先付费再访问"。

```typescript
export function createPaywallMiddleware(priceEngine, verifier, merchantWallet): RequestHandler {
  return async (req, res, next) => {
    const pricing = priceEngine.match(req.method, req.path);
    if (!pricing) return next();        // 该路由不收费，放行

    const paymentHeader = req.headers["x-payment"];
    if (!paymentHeader) {
      // 第一次请求 → 返回 402
      return res.status(402).json({
        x402Version: 1,
        accepts: [{
          scheme: "exact",
          network: "eip155:10143",
          maxAmountRequired: pricing.amountInWei,
          resource: req.path,
          description: pricing.description,
          mimeType: "application/json",
          payTo: merchantWallet,
          extra: { name: pricing.token, decimals: pricing.decimals },
        }],
      });
    }

    // 第二次请求 → 验证支付
    const verification = await verifier.verify(paymentHeader, pricing);
    if (!verification.valid) {
      return res.status(402).json({ error: "payment_invalid", reason: verification.reason });
    }
    req.payment = verification;
    req.pricing = pricing;
    next();
  };
}
```

**复用价值**：直接放在任何 Express 应用的全局中间件位置，`PriceEngine` 控制哪些路由收钱、收多少；其他业务代码完全不用改。

### 5.5 卖方：PaymentVerifier 三路验证 + 防重放

`payment-verifier.ts:42-99` —— 三种验证模式：facilitator / 链上 / 仅签名。

```typescript
private usedPayments: Set<string> = new Set();    // 防重放缓存

async verify(paymentHeader: string, pricing: PricingRule): Promise<PaymentVerification> {
  const parsed = parsePaymentHeader(paymentHeader);

  // 防重放：txHash 或 nonce 任一作为 key
  const replayKey = parsed.txHash ?? parsed.nonce;
  if (replayKey && this.usedPayments.has(replayKey)) {
    return { valid: false, reason: "Replay detected: payment already used" };
  }

  let result;
  if (this.facilitatorUrl) {
    result = await this.verifyViaFacilitator(parsed, pricing);    // x402 标准 facilitator
  } else if (parsed.txHash) {
    result = await this.verifyOnChain(parsed);                    // viem 直接读 receipt
  } else {
    result = { valid: true, reason: "signature_only", ... };       // 兜底
  }

  if (result.valid && replayKey) this.usedPayments.add(replayKey);
  return result;
}
```

**链上验证**：

```typescript
const receipt = await client.getTransactionReceipt({ hash: parsed.txHash });
if (receipt.status !== "success") return { valid: false, reason: "Transaction reverted on-chain" };
return { valid: true, reason: "on_chain_verified", txHash: parsed.txHash, payer: parsed.payer ?? receipt.from };
```

**踩坑提醒**：
- 防重放的 `Set` 在进程重启会丢，生产场景要落 Redis 或 SQLite。但 hackathon demo 用 in-memory Set 已经够。
- `parsePaymentHeader` 同时支持 raw JSON 和 base64 JSON（agent 端可能任选其一）。

### 5.6 PriceEngine：YAML 路由匹配 + `*` 通配

`price-engine.ts:16-78`：

```typescript
function matchPattern(pattern: string, path: string): boolean {
  if (pattern === path) return true;
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length) return false;
  return patternParts.every((seg, i) => seg === "*" || seg === pathParts[i]);
}

match(method: string, path: string): PricingRule | null {
  const upperMethod = method.toUpperCase();
  return this.rules.find((rule) =>
    (rule.method === "*" || rule.method === upperMethod) &&
    matchPattern(rule.pattern, path)
  ) ?? null;
}
```

YAML 配置示例：

```yaml
defaults:
  token: MON
  rateLimit: 60
routes:
  - method: GET
    pattern: /api/v1/weather
    price: "0.001"
    zone: safe
    description: "Real-time weather data"
  - method: POST
    pattern: /api/v1/compute
    price: "0.015"
    zone: buffer
  - method: POST
    pattern: /api/v1/deploy
    price: "0.075"
    zone: critical
  - method: GET
    pattern: /api/v1/premium/*       # 通配
    price: "0.01"
```

**复用价值**：用 YAML 代替硬编码价格表，商家改价不用重启代码 + 不用 DB。`*` 段通配满足 90% 场景，复杂的 regex 留作未来再加。

### 5.7 标准 402 响应体（直接复制）

```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:10143",
    "maxAmountRequired": "1000000000000000",
    "resource": "/api/v1/weather",
    "description": "Weather data API - single query",
    "mimeType": "application/json",
    "payTo": "0xMerchantWallet",
    "extra": { "name": "MON", "decimals": 18 }
  }]
}
```

响应 header（可选但推荐，方便 agent 不解析 body 也能拿到关键信息）：

```
X-PAYMENT-REQUIRED: true
X-PAYMENT-PRICE: 0.001
X-PAYMENT-TOKEN: MON
X-PAYMENT-CHAIN: eip155:10143
X-PAYMENT-RECIPIENT: 0xMerchantWallet
X-PAYMENT-SCHEME: exact
```

### 5.8 三种计费模式

| 模式 | 适用 | 实现要点 |
|---|---|---|
| `per_request` | 一次性 API 调用（天气、查询） | 默认。每次请求验证一次 |
| `per_time` | 订阅式（CDN、premium feed） | 验证后给 client 发 token / cookie，有效期内不再 402 |
| `per_volume` | 按量（compute、bandwidth） | 验证后扣减预付额，余额不足再 402 |

本项目当前只实现了 `per_request`，但配置预留了 `mode` 字段。

### 5.9 下次套用 checklist

- [ ] 买方：probe + payAndFetch 双阶段，**让 policy engine 在付钱前介入**
- [ ] 买方：native 走 sendTransaction + base64 X-PAYMENT 重试，ERC-20 走 EIP-3009 lib
- [ ] 卖方：paywall middleware + price engine + verifier 三件套
- [ ] 防重放：txHash / nonce 作为 key，至少 in-memory Set；生产用 Redis
- [ ] 验证模式：facilitator / on-chain / signature-only 三选一，配 fallback
- [ ] YAML 价格表 + `*` 路径通配
- [ ] 标准 402 响应体格式照抄（accepts[] 是数组，未来支持多 token 报价）
- [ ] X-PAYMENT header 一律 base64

---

## 6. MCP Server 工具集设计

> **本章解决什么**：把"AI agent 怎么调你的服务"这件事做对。MCP 是 2024-2025 的事实标准，对接 Claude Code / Cursor / Windsurf 一套配置通吃。

### 6.1 工具命名学（动词_对象）

```
setup_wallet         create_session       make_payment
get_balance          revoke_session       pay_for_api
                     list_sessions
get_policy
update_policy
get_history          emergency_pause
get_spending_summary
```

**复用价值**：
- 一律 `verb_noun` 蛇形命名（与 Python 风格一致，LLM 训练数据里这种命名最熟）
- "查询"用 `get_*`，"修改"用 `update_* / set_*`，"创建"用 `create_*`，"删除"用 `revoke_* / remove_*`
- 同一个对象的 CRUD 集中（如 session 的 create/revoke/list 三件套）

### 6.2 三态确认机制（适配 LLM tool call UX）

`packages/mcp-server/src/tools/payment.ts:74-81` —— 用一个 `confirmed: boolean` 参数实现"先解释 → 用户确认 → 再执行"的两步流程。

```typescript
server.tool("make_payment", "...", {
  to: z.string(),
  amount: z.string(),
  reason: z.string(),
  confirmed: z.preprocess(
    (v) => v === "true" || v === true,    // 兼容字符串
    z.boolean(),
  ).default(false),
}, async (params) => {
  const decision = state.policyEngine.evaluate({...});

  if (decision.action === "reject") {
    return { content: [{ type: "text", text: `Payment REJECTED:\n${decision.reasons.join("\n")}` }] };
  }

  // 关键：require_confirmation 时，第一次调用返回解释信息，不执行
  if (decision.action === "require_confirmation" && !params.confirmed) {
    return {
      content: [{ type: "text", text:
        `${decision.message}\n\nTo proceed, call make_payment again with confirmed: true`
      }],
    };
  }

  // 第二次调用（confirmed=true）真正执行
  const result = await state.txBuilder.payUSDC(...);
  ...
});
```

**为什么这样设计**：
- LLM 工具调用是"一来一回"的对话，不能弹原生 UI 让用户点确认。
- 把"需要确认"作为工具的 **return value**，让 LLM 把它转告用户、收到用户授权后再调用 tool 第二次。
- `z.preprocess` 兼容字符串 `"true"` 和布尔 `true`（不同 MCP 客户端序列化不一致）。

### 6.3 工具输出风格：纯文本 > JSON

```typescript
return {
  content: [{
    type: "text",
    text: [
      `Payment successful!`,
      `Amount: ${params.amount} ${params.token}`,
      `To: ${recipientLabel || params.to}`,
      `Reason: ${params.reason}`,
      `Tx: ${result.txHash}`,
      `Audit ID: ${auditEntry.id}`,
      `Risk: ${riskLevel}`,
    ].join("\n"),
  }],
};
```

**复用价值**：MCP 工具的 return 是给 LLM 读的，不是给程序读的。**纯文本多行 + key:value 对齐** 比 JSON 更友好（LLM 能直接把它复述给用户，不需要再解析一层）。**只有当数据结构复杂到必须用 JSON 时（如 list_sessions 返回多个对象）才考虑 JSON**。

### 6.4 ServerState 单例模式

`packages/mcp-server/src/index.ts`：

```typescript
export interface ServerState {
  wallet: AgentVaultWallet | null;
  sessionKeyManager: SessionKeyManager | null;
  txBuilder: TransactionBuilder | null;
  policyEngine: PolicyEngine;       // 不需要 wallet，独立
  auditLogger: AuditLogger;          // 不需要 wallet，独立
  x402Client: X402Client | null;     // lazy init
  agentId: string;
}

const state: ServerState = {
  wallet: null,
  sessionKeyManager: null,
  txBuilder: null,
  policyEngine: new PolicyEngine(),
  auditLogger: new AuditLogger(),
  x402Client: null,
  agentId: process.env.AGENT_VAULT_AGENT_ID ?? "unknown",
};

registerWalletTools(server, state);
registerSessionTools(server, state);
registerPaymentTools(server, state);
registerPolicyTools(server, state);
registerAuditTools(server, state);
registerResources(server, state);
```

**复用价值**：
- 单一 state 对象注入所有 tool registrar，避免每个 tool 自己 import + new
- `wallet / sessionKeyManager / txBuilder` 用 `null` 初始化（要等 `setup_wallet` 调用后才实例化），policy / audit 进程启动就能用
- agentId 从环境变量读，方便多 agent 部署时审计区分

### 6.5 通用 stdio 配置（Claude Code / Cursor / Windsurf 通吃）

```json
{
  "mcpServers": {
    "agentvault": {
      "command": "node",
      "args": ["/abs/path/to/packages/mcp-server/dist/index.js"],
      "env": {
        "OWNER_PRIVATE_KEY": "0x...",
        "AGENTVAULT_ADDRESS": "0x...",
        "MONAD_RPC_URL": "https://testnet-rpc.monad.xyz",
        "AGENT_VAULT_AGENT_ID": "claude-code-main"
      }
    }
  }
}
```

**复用价值**：
- `command: node` + `args: [absolute path to dist/index.js]` 是 stdio MCP 的标准格式
- 私钥走 env，**绝对不要**让 agent 把私钥作为 tool 参数传递
- agentId 也走 env，方便不同 agent 实例区分审计日志

### 6.6 MCP Resources（少用但别忘）

3 个 resources（`packages/mcp-server/src/resources/index.ts`）：
- `agentvault://wallet/state` — 钱包当前状态（balance / vault address）
- `agentvault://policy/current` — 当前 policy YAML
- `agentvault://audit/recent` — 最近审计记录

**Tool vs Resource 选择**：
- 有副作用（写链 / 写文件） → tool
- 只读、无参数、稳定 → resource
- 资源让 agent 可以"被动注入"上下文（如启动时自动读 policy），不是每次都要主动调

### 6.7 下次套用 checklist

- [ ] 工具命名 `verb_noun` 蛇形
- [ ] 任何"需要用户确认"的操作都用 `confirmed: boolean` 参数实现两步流程
- [ ] `z.preprocess` 兼容字符串布尔
- [ ] 输出纯文本多行（key:value 风格），结构复杂时才用 JSON
- [ ] ServerState 单例 + tool registrar 模式
- [ ] 私钥走 env，绝不在 tool 参数里
- [ ] 提供 stdio config json，给 Claude Code / Cursor / Windsurf 一键加 server
- [ ] 只读 + 稳定的数据用 resource，不要全部塞 tool

---

## 7. 三段式风险分区业务模型（产品 idea 层）

> **本章解决什么**：这是本项目最有"产品 sense"的设计。它给 agentic 产品提供了一个通用的"自动 / 半自动 / 强制人工"的三段式决策模板，不限于支付场景。

### 7.1 三段式分区核心定义

| 区域 | 阈值（金额） | 决策模式 | UX 表现 |
|---|---|---|---|
| **Safe_Zone** | < 0.01 MON | 静默自动执行 | dashboard 弹小通知，事后告知 |
| **Buffer_Zone** | 0.01 - 0.03 MON | 通知 + 倒计时 120s 缺省同意 | 推 Telegram / 企微，用户不响应即认为同意 |
| **Critical_Zone** | > 0.05 MON | 强制人工二次确认 | 弹 Passkey / 钱包签名窗口 |

> 阈值是 hackathon 演示用的 demo 值。生产场景应该按用户画像或日均消费动态调整。

### 7.2 三个示范场景（来自 `docs/场景设计.md`）

**场景 A — Safe_Zone（CDN 自动续费）**

```
1. Agent 内核：发现 CDN_Service 24h 内过期
2. PolicyEngine：amount 0.002 MON < 0.01 → PASS
3. 链上：transfer(provider, 0.002 MON)
4. Dashboard：弹通知 "已自动续费 CDN，消耗 0.002 MON"
```

**场景 B — Buffer_Zone（RPC 延迟扩容）**

```
1. Monitor：连续 5 分钟延迟 > 200ms
2. PolicyEngine：amount 0.015 MON ∈ [0.01, 0.03] → require_notification
3. Telegram bot：⚠️ 检测拥堵，建议升级极速模式 0.015 MON，120s 内拒绝即取消
4. 用户未响应 → 倒计时归零 → 缺省同意 → 链上扣款
5. 回执："因未收到拒绝指令，已为您扩容"
```

**场景 C — Critical_Zone（合约部署）**

```
1. Agent：准备部署新环境，预估 0.075 MON
2. PolicyEngine：amount 0.075 MON > 0.05 → require_human
3. 前端弹 Passkey / 钱包窗口
4. 用户指纹/签名确认
5. 链上交易广播
```

### 7.3 三参数化抽象（任何 agentic 产品都能套）

把这套模型抽象成 3 个参数，任何 agentic 决策都能套用（不只是支付）：

| 参数 | 维度 |
|---|---|
| **Threshold** | 风险阈值（金额 / 数据量 / 影响范围） |
| **Notification** | 通知方式（无 / Telegram-bot / 企微 / 推送 / 弹窗） |
| **Default** | 缺省行为（执行 / 等待倒计时 / 拒绝） |

不同组合：

| 组合 | = 实现的策略 |
|---|---|
| Threshold low + Notification 无 + Default 执行 | Safe_Zone |
| Threshold mid + Notification Telegram + Default 倒计时执行 | Buffer_Zone |
| Threshold high + Notification 弹窗 + Default 拒绝（必须确认） | Critical_Zone |

**举例非支付场景的套用**：
- **AI 自动写代码 + 提 PR**：小修改自动 merge / 中等修改 review 倒计时合并 / 大重构强制人工 review
- **agent 自动操作 GitHub issue**：评论自动 / 关闭倒计时 / 修改 milestone 强制确认
- **agent 给用户发邮件**：内部地址自动 / 客户地址倒计时（5min 内可撤回）/ 法务地址强制人工

### 7.4 落到代码：PolicyEngine 怎么暴露这套

`policy-engine.ts:36-129` 已经实现了核心三态。落到 zone 模型的 hint：

```typescript
// 在 evaluate() 里同时返回 zone（已有 reasons + action，加一个 zone 字段即可）
function classifyZone(amountHuman, thresholds): "safe" | "buffer" | "critical" {
  if (amountHuman < thresholds.safe) return "safe";          // < 0.01
  if (amountHuman < thresholds.buffer) return "buffer";      // < 0.03
  return "critical";
}
```

并在 `policy.yaml` 加上：

```yaml
zones:
  safe:    { upTo: 0.01,  action: auto_execute }
  buffer:  { upTo: 0.03,  action: notify_with_timeout, timeoutSec: 120 }
  critical:{ upTo: null,  action: require_human }
notifications:
  channel: telegram   # telegram | wechatwork | webhook | none
  webhookUrl: ${TELEGRAM_BOT_URL}
```

> 本项目当前只实现了 `requireApprovalAbove` 的二段式（approve / require_confirmation / reject），三段式 + 倒计时是下次冲分的方向。

### 7.5 下次套用 checklist

- [ ] 任何 agentic 产品先把 "决策 zones" 想清楚（safe / buffer / critical 三段）
- [ ] 阈值参数化、通知通道参数化、缺省行为参数化
- [ ] `safe` 走静默 + 事后通知（不能完全沉默，要有 dashboard 痕迹）
- [ ] `buffer` 必须有 timeout 兜底（否则用户没看到通知就卡住了）
- [ ] `critical` 必须强制 human-in-the-loop（Passkey > 钱包签名 > 短信）
- [ ] zone 字段一定写进审计日志（事后可以分析"哪些走了 critical, 哪些走了 safe"）
- [ ] 阈值不要写死，给用户改的能力（在前端 settings 暴露）

---

## 8. Stripe 风格 Design System 沉淀

> **本章解决什么**：fintech / Web3 dashboard 的视觉调性，直接复用本项目 `DESIGN.md` 里抽出的核心 design tokens。下次做任何"金融严肃感 + 现代克制"风格的前端，把这一章交给 AI 即可。

### 8.1 核心 design tokens（速查）

```css
/* 色彩 */
--brand-primary: #533afd;           /* 主色 (CTA / 链接) */
--brand-primary-hover: #4434d4;
--brand-dark: #1c1e54;              /* 深色 section 背景 */

--text-heading: #061b31;            /* 标题（不用 #000） */
--text-label:   #273951;            /* 表单标签 */
--text-body:    #64748d;            /* 正文 */

--surface-bg: #ffffff;
--surface-border: #e5edf5;          /* 卡片边框 */

--accent-success: #15be53;          /* 成功 badge 边框（带 0.2-0.4 alpha） */
--accent-success-text: #108c3d;
--accent-ruby: #ea2261;             /* 装饰渐变用，禁用于按钮 */
--accent-magenta: #f96bee;          /* 装饰渐变用 */

/* 阴影（关键创新：蓝调而非纯灰） */
--shadow-card:
  rgba(50,50,93,0.25)  0 30px 45px -30px,
  rgba(0,0,0,0.1)      0 18px 36px -18px;

--shadow-ambient: rgba(23,23,23,0.08) 0 15px 35px 0;

/* 圆角（保守路线，不要 pill） */
--radius-sm: 4px;     /* 按钮 / 输入 / badge */
--radius-md: 6px;     /* 导航 / 中型卡片 */
--radius-lg: 8px;     /* featured 卡片 */

/* 间距（8px 基础，小端密集） */
--space-1: 1px;
--space-2: 2px;
--space-4: 4px;
--space-6: 6px;
--space-8: 8px;
--space-12: 12px;
--space-16: 16px;
--space-20: 20px;
```

### 8.2 字体 —— Stripe 设计的精髓

```css
font-family: 'sohne-var', 'SF Pro Display', sans-serif;
font-feature-settings: "ss01";   /* 全局必加！这是 Stripe 字体的灵魂 */

/* 数字（金融数据） */
font-feature-settings: "tnum";   /* 等宽数字，对账时不错位 */

/* 代码 */
font-family: 'SourceCodePro', 'SFMono-Regular', monospace;
```

**字号 + 字重 + tracking（display 越大越紧）**：

| 用途 | size | weight | line-height | letter-spacing |
|---|---|---|---|---|
| Hero | 56px | **300** | 1.03 | -1.4px |
| Display Large | 48px | **300** | 1.15 | -0.96px |
| Section Heading | 32px | **300** | 1.10 | -0.64px |
| Sub-heading | 22px | 300 | 1.10 | -0.22px |
| Body | 16px | 300-400 | 1.40 | normal |
| Button | 16px | 400 | 1.00 | normal |
| Caption | 13px | 400 | normal | normal |

**核心创新**：**display sizes 用 weight 300（极轻）**。这是 Stripe 区别于 99% fintech 网站的关键 —— 大多数都用 600-700 的粗体来"宣示存在"，Stripe 反向操作，用极轻的字重 + 紧的 tracking 表达"我够自信，不需要喊"。

### 8.3 Shadow philosophy（蓝调多层阴影）

```css
/* 标准卡片阴影 —— 抄到任何 fintech 网站立刻有 Stripe 味 */
box-shadow:
  rgba(50, 50, 93, 0.25)  0 30px 45px -30px,    /* 远景蓝调 */
  rgba(0, 0, 0, 0.1)      0 18px 36px -18px;    /* 近景中性 */
```

**核心思想**：阴影颜色不要用纯灰 `rgba(0,0,0,...)`，而是带蓝色色调的 `rgba(50,50,93,...)`。这样阴影本身就成了品牌色的延伸，而不是脱离主题的"脏"。负 spread 值（`-30px`）让阴影只向下延伸，不向旁边外溢。

### 8.4 组件标准（直接抄到 Tailwind config）

**按钮（Primary Purple）**：

```css
.btn-primary {
  background: #533afd;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font: 400 16px 'sohne-var';
  font-feature-settings: "ss01";
}
.btn-primary:hover { background: #4434d4; }
```

**卡片**：

```css
.card {
  background: white;
  border: 1px solid #e5edf5;
  border-radius: 6px;
  box-shadow:
    rgba(50,50,93,0.25)  0 30px 45px -30px,
    rgba(0,0,0,0.1)      0 18px 36px -18px;
}
```

**Success Badge**：

```css
.badge-success {
  background: rgba(21,190,83,0.2);
  color: #108c3d;
  border: 1px solid rgba(21,190,83,0.4);
  padding: 1px 6px;
  border-radius: 4px;
  font: 300 10px 'sohne-var';
}
```

### 8.5 给 AI 的提示词模板（下次直接复制）

> "Use the Stripe-inspired design system: white background (#ffffff), deep navy headings (#061b31), purple CTA (#533afd, hover #4434d4), slate body text (#64748d). Typography: sohne-var font weight 300 for headings (yes, light, not bold), with `font-feature-settings: 'ss01'` everywhere; weight 400 for buttons. Negative letter-spacing on display sizes (-1.4px at 56px, -0.96px at 48px, -0.64px at 32px). Shadows must use blue-tinted multi-layer formula: `rgba(50,50,93,0.25) 0 30px 45px -30px, rgba(0,0,0,0.1) 0 18px 36px -18px`. Border radius stays in 4-8px range, no pill shapes. Use `tnum` font-feature for any tabular numbers. Dark sections use #1c1e54 (not black). Accent ruby/magenta for decorative gradients only (never for buttons or links)."

把这段直接给 Claude / Cursor，前端立刻有 Stripe 味。

### 8.6 Do's & Don'ts（关键 5 条）

| Do | Don't |
|---|---|
| 用 weight **300** 做大标题 | 用 weight 600/700 做大标题（违背 Stripe 美学） |
| 阴影用 `rgba(50,50,93,...)` 蓝调 | 阴影用 `rgba(0,0,0,...)` 纯灰 |
| 标题用 `#061b31` 深海军 | 标题用 `#000` 纯黑 |
| 圆角 4-8px 区间 | 12px+ 大圆角 / pill 形 |
| Ruby/Magenta 仅用于装饰渐变 | Ruby/Magenta 用于按钮 / 链接 |

### 8.7 下次套用 checklist

- [ ] 在 Tailwind config 把 8.1 的 token 全配上
- [ ] 全局加 `font-feature-settings: "ss01"`（不加这个 = 没用 Stripe 字体）
- [ ] 数字字段单独加 `tnum`
- [ ] 阴影变量用 `--shadow-card` 双层
- [ ] 圆角不超过 8px
- [ ] 给 AI 写前端时，把 8.5 的提示词整段粘进去

---

## 9. 一键部署 / 一键启动脚本沉淀

> **本章解决什么**：hackathon 评委只有 5 分钟看你项目，**部署难度直接影响评分**。这一章沉淀本项目的"一键化"技巧。

### 9.1 README 顶部 AGENT-README 注释块

`README.md:3-54` 的开头是一个 HTML 注释块，**专门写给 AI agent 读**：

```markdown
<!--
AGENT-README: This section is optimized for AI agents (Claude Code, Cursor, Windsurf, Copilot, etc.)
If you are an AI agent, read this block first for quick project understanding and deployment.

PROJECT: AgentVault — ...
TECH: Solidity 0.8.28 + TypeScript + Viem + MCP SDK + Next.js 14 + Express + SQLite
CHAIN: Monad Testnet (Chain ID: 10143, RPC: https://testnet-rpc.monad.xyz)
MONOREPO: pnpm workspace — contracts/ + packages/{sdk, mcp-server, frontend, merchant-server}

QUICK DEPLOY (6 commands):
  git clone https://github.com/.../agentvault && cd agentvault
  pnpm install
  curl -L https://foundry.category.xyz | bash && source ~/.zshrc && foundryup --network monad
  cp .env.example .env   # then set OWNER_PRIVATE_KEY
  ./scripts/deploy.sh
  pnpm build

MCP SETUP (Claude Code):
  claude mcp add agentvault node $(pwd)/packages/mcp-server/dist/index.js

ENV VARS (required): ...
TEST COMMANDS: ...
-->
```

**复用价值**：
- 评委用 AI 看你项目时，AI 第一眼看到的就是这个块，立刻知道怎么跑
- 把 "tech stack / chain / quick deploy / mcp setup / env vars / test commands" 6 个段全列出来
- HTML 注释（`<!-- -->`）对人类读者不可见，对 LLM 完全可见 —— **零成本，全收益**

### 9.2 `scripts/deploy.sh` 全自动化范式

```bash
#!/bin/bash
set -e

# 1. 加载 .env
source "$ROOT/.env"
[ -z "$OWNER_PRIVATE_KEY" ] && { echo "请设置 OWNER_PRIVATE_KEY"; exit 1; }

# 2. 编译
cd "$ROOT/contracts" && forge build

# 3. 部署 + 抓输出
OUTPUT=$(forge script script/Deploy.s.sol:DeployAgentVault \
  --rpc-url "$RPC" \
  --private-key "$OWNER_PRIVATE_KEY" \
  --broadcast 2>&1)

# 4. 用 grep + awk 解析合约地址
CONTRACT=$(echo "$OUTPUT" | grep "AgentVault deployed at:" | awk '{print $NF}')

# 5. sed 写回 .env（macOS 用 sed -i ''）
if grep -q "AGENTVAULT_ADDRESS=" .env; then
  sed -i '' "s|AGENTVAULT_ADDRESS=.*|AGENTVAULT_ADDRESS=$CONTRACT|" .env
else
  echo "AGENTVAULT_ADDRESS=$CONTRACT" >> .env
fi

# 同步 NEXT_PUBLIC_VAULT_ADDRESS（前端）
sed -i '' "s|NEXT_PUBLIC_VAULT_ADDRESS=.*|NEXT_PUBLIC_VAULT_ADDRESS=$CONTRACT|" .env 2>/dev/null || true

echo "✓ 部署完成: $CONTRACT"
echo "  浏览器: https://testnet.monadexplorer.com/address/$CONTRACT"
```

**复用价值**：
- 5 步流程：加载 env → 编译 → 部署 → 解析 → 写回。**绝大多数 hackathon 部署都套这个流程**
- `forge script ... --broadcast 2>&1` 把日志重定向到变量，方便用 grep + awk 解析
- macOS 的 `sed -i ''` 跟 Linux 的 `sed -i` 不同（macOS 必须显式空字符串作为 backup 后缀）；hackathon demo 通常 macOS，按这个写

### 9.3 Deploy.s.sol 输出约定

```solidity
function run() external {
    AgentVault vault = new AgentVault(...);
    console.log("AgentVault deployed at:", address(vault));   // 给 deploy.sh grep 用
}
```

**复用价值**：在 Foundry script 用一行 `console.log("X deployed at:", address)` 输出地址，shell 用 `grep "deployed at:" | awk '{print $NF}'` 提取。约定即接口。

### 9.4 `start-all.sh` —— 一键起所有服务

```bash
#!/bin/bash
# 后台启 merchant + frontend，前台看日志（Ctrl+C 同时 kill）
(cd packages/merchant-server && pnpm dev) &
MERCHANT_PID=$!
(cd packages/frontend && pnpm dev) &
FRONTEND_PID=$!

trap "kill $MERCHANT_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
```

### 9.5 `.env.example` 设计

```bash
# Required
OWNER_PRIVATE_KEY=0x...
AGENTVAULT_ADDRESS=0x...    # 填空，deploy.sh 会自动写入

# Optional
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
AGENT_VAULT_AGENT_ID=unknown
MERCHANT_PORT=4020
MERCHANT_WALLET_PRIVATE_KEY=
KEYSTORE_PASSWORD=
NEXT_PUBLIC_VAULT_ADDRESS=
```

**复用价值**：
- Required / Optional 用注释清晰隔开
- 部署脚本要写回的字段（`AGENTVAULT_ADDRESS`, `NEXT_PUBLIC_VAULT_ADDRESS`）默认空
- 前端用 `NEXT_PUBLIC_*` 前缀（Next.js 约定）

### 9.6 下次套用 checklist

- [ ] README 顶部加 HTML 注释 `AGENT-README` 块（zero cost, huge gain）
- [ ] `scripts/deploy.sh`：load env → build → deploy → grep 解析 → sed 写回
- [ ] Foundry script `console.log("X deployed at:", addr)` 配 `grep + awk`
- [ ] macOS 的 `sed -i ''` 别忘
- [ ] `start-all.sh` 用 `&` 后台 + `trap EXIT` 清理
- [ ] `.env.example` Required / Optional 注释隔开
- [ ] 每个写回字段都让脚本"幂等"（grep -q 后决定 sed 还是 echo append）

---

## 10. 测试策略

> **本章解决什么**：hackathon 评委会问"你怎么证明这东西能跑"。本项目用三层金字塔，**底层不需要任何 .env 都能跑**。

### 10.1 三层测试金字塔

```
       ┌─────────────────────────────────┐
       │  Layer 3: e2e 链上 demo (1 个)    │  ← 最重，需要 .env + MON
       │  source .env && tsx demo/e2e-demo.ts
       └─────────────────────────────────┘
       ┌─────────────────────────────────┐
       │  Layer 2: 集成检查 (13 项)        │  ← 不需要链
       │  pnpm exec tsx demo/local-test.ts
       └─────────────────────────────────┘
       ┌─────────────────────────────────┐
       │  Layer 1: 单元测试               │  ← 零配置
       │  - Forge: 30 个合约测试           │
       │  - Vitest: 27 个 SDK 测试         │
       └─────────────────────────────────┘
```

| Layer | 命令 | 数量 | 配置 |
|---|---|---|---|
| Forge 合约测试 | `cd contracts && forge test -v` | 30 | 零配置 |
| SDK 单元测试 | `pnpm test:sdk` | 27 | 零配置 |
| 本地集成检查 | `pnpm exec tsx demo/local-test.ts` | 13 | 零配置 |
| 链上 e2e demo | `source .env && pnpm exec tsx demo/e2e-demo.ts` | 1 | 需 .env |

### 10.2 「零配置 local-test」设计模式

`demo/local-test.ts` 是关键技巧 —— **让评委不需要 RPC、不需要钱包、不需要 .env**，光凭 `pnpm install` 就能跑出 13 个 ✓ 出来。

包含的检查（按本项目实际）：
- ✅ SDK 能不能 import
- ✅ Wallet.generate() 能不能造出合法钱包
- ✅ AES-256-GCM 加密 / 解密 round-trip
- ✅ PolicyEngine.evaluate() 各种场景
- ✅ AuditLogger 写入 / 查询
- ✅ X402Client.probe() mock URL（不发真实请求）
- ✅ TransactionBuilder ABI encode 是否正确

**复用价值**：hackathon 评分时间紧，评委大概率不会 `cp .env`。**给一个不依赖任何外部资源的 demo 脚本**，让 `pnpm install && pnpm exec tsx demo/local-test.ts` 直接出 13 个绿勾，**视觉冲击力强**。

### 10.3 Forge 测试关键点

`contracts/test/AgentVault.t.sol` —— 30 个测试覆盖：

```
Session Key 增删查         (5 个)
execute 权限检查           (8 个)
  - 时间窗 (validAfter / validUntil)
  - 白名单
  - 单笔限额
  - 每日限额
  - token 约束
每日重置                  (3 个)
紧急暂停                  (2 个)
提取资产                  (2 个)
所有权                    (2 个)
事件 emit                 (3 个)
原生 + ERC-20             (5 个)
```

**关键 Forge 套路**：

```solidity
// MockERC20 内嵌在测试文件，避免外部依赖
contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    function transfer(address to, uint256 amount) external returns (bool) { ... }
    function approve(address spender, uint256 amount) external returns (bool) { ... }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) { ... }
}

// vm.prank 模拟身份切换
vm.prank(owner);
vault.addSessionKey(...);

// vm.deal 给地址塞原生 token
vm.deal(address(vault), 100 ether);

// vm.warp 时间穿越（测试 expiry）
vm.warp(block.timestamp + 2 days);

// vm.expectRevert 期望抛错
vm.expectRevert(AgentVault.SessionExpired.selector);
vault.execute(...);
```

### 10.4 Vitest SDK 测试要点

```typescript
// 测 PolicyEngine 用临时文件，每个测试隔离
const tmpPolicy = `/tmp/policy-${Date.now()}.yaml`;
const engine = new PolicyEngine(tmpPolicy);
expect(engine.evaluate({...})).toMatchObject({ action: "approve" });

// 测 AuditLogger 用 in-memory SQLite
const logger = new AuditLogger(":memory:");
const entry = logger.log({...});
expect(logger.getById(entry.id)).toBeTruthy();
```

### 10.5 下次套用 checklist

- [ ] 三层金字塔结构（forge / vitest / local-test / e2e）
- [ ] `local-test` 必须零配置可跑（评委只 `pnpm install` 不会 `.env`）
- [ ] Forge MockERC20 内嵌测试文件，不外部依赖
- [ ] vm.prank / vm.deal / vm.warp / vm.expectRevert 四件套用熟
- [ ] Vitest 用临时文件 + `:memory:` SQLite，测试间不串味
- [ ] README 把 4 条测试命令直接放出来，让评委能直接抄

---

## 11. 踩过的坑 + 下次直接绕过的提醒

> **本章解决什么**：本项目开发中遇到的所有非显然问题，**每条提醒都对应一次损失的开发时间**。

### 11.1 Monad 状态同步延迟

**症状**：刚调完 `addSessionKey` + `waitForTransactionReceipt` 返回成功，立即用新 session key 调 `execute()` 报 `SessionNotActive`。

**根因**：Monad 测试网 receipt 返回不代表全 RPC 节点状态同步完。

**绕过**：

```typescript
await publicClient.waitForTransactionReceipt({ hash });
await new Promise((r) => setTimeout(r, 2000));   // 兜底等 2s
```

**提醒**：仅 Monad 需要。其他主流链（以太坊、Arbitrum、Optimism）`waitForReceipt` 已经够。

### 11.2 Session Key 必须 fund gas

**症状**：session key 注册成功，调 `execute()` 报 "insufficient funds for gas"。

**根因**：链上限额检查是 vault 的事，但 session key 自己要付 tx gas。新生成的 EOA 余额是 0。

**绕过**：

```typescript
await ownerClient.sendTransaction({
  to: account.address,
  value: parseEther("0.1"),   // 0.1 MON 经验值，约 30 笔
});
```

### 11.3 ERC-20 selector 提取的边界

**症状**：恶意构造的短 calldata 让 `_extractSpendAmount` revert，错误信息不友好；或绕过限额检查。

**绕过**：严格 length check。

```solidity
if (data.length >= 68) {
    bytes4 selector = bytes4(data[:4]);
    if (selector == TRANSFER_SELECTOR || selector == APPROVE_SELECTOR) {
        (, tokenAmount) = abi.decode(data[4:68], (address, uint256));
    } else if (selector == TRANSFER_FROM_SELECTOR && data.length >= 100) {
        (,, tokenAmount) = abi.decode(data[4:100], (address, address, uint256));
    }
}
// 不在 if 内的（不识别的 selector / 短 calldata）→ tokenAmount = 0 → 走 native value 限额
```

### 11.4 x402 native token 不走 EIP-3009

**症状**：用 `@x402/fetch` lib 直接对原生 token 端点调用，报 "asset not found" 或签名失败。

**根因**：EIP-3009 是 ERC-20 标准，原生 token 没有这个东西。

**绕过**：判断 `accept.asset === undefined || NATIVE_TOKEN_NAMES.has(accept.extra?.name)` → 走自实现的 `nativePayAndFetch` 路径（sendTransaction + base64 X-PAYMENT 重试）。

### 11.5 Lazy reset 比 cron 稳健

**反例**：用 keeper / cron 每天 0 点重置 `dailySpent` —— 一旦 keeper 挂了，限额永远不重置。

**正例**：每次 `execute` / view 都判断 `if (lastResetDay < today) dailySpent = 0`。

**适用范围**：任何"周期配额"。日 / 周 / 月都用同样模式（divisor 改成 1 days / 7 days / 30 days）。

### 11.6 viem 的 `as any` 临时绕过类型问题

**症状**：viem 类型推断特别严格，`writeContract` 的 args 类型经常对不上。

**绕过（hackathon 用）**：

```typescript
const hash = await (ownerClient as any).writeContract({...});
```

**提醒**：本项目 SDK 大量用 `as any`。生产代码应该把 `WalletClient` 泛型参数填全，hackathon 阶段先 ship。

### 11.7 macOS sed -i 必须空字符串

**症状**：`sed -i "s/.../.../" file` 在 macOS 报错 "extra characters at the end of l command"。

**绕过**：

```bash
sed -i '' "s/.../.../" file    # macOS
sed -i ''  "s/.../.../" file   # macOS
sed -i    "s/.../.../" file    # Linux
```

### 11.8 `getActiveSessionKey()` 简化假设

`session-key.ts:193-196` 用 "最后创建的就是 active" 这个简化假设 —— Map 的最后一个 key。生产应该按 `validUntil` / 当前时间挑。**hackathon demo 可以用，写产品时改掉**。

### 11.9 防重放 set 进程重启会丢

`payment-verifier.ts:46` `usedPayments: Set<string>` 是内存的。重启后旧 txHash 可以重放（因为 set 空了）。

**生产场景**：换 Redis 或 SQLite 持久化。**hackathon demo 用 Set 没问题**（评委不会重启你的服务来重放）。

### 11.10 ABI JSON 的 import

```typescript
const __dirname = dirname(fileURLToPath(import.meta.url));
export const AGENT_VAULT_ABI = JSON.parse(
  readFileSync(join(__dirname, "abi", "AgentVault.json"), "utf-8")
) as any;
```

**为什么**：ESM 不支持 `import json from "./x.json"`（实验阶段，需要 `assert { type: "json" }`，不同 bundler 兼容性差）。**直接 `readFileSync` 最稳**。

### 11.11 下次套用 checklist

- [ ] Monad 上写操作后 `sleep 2000ms`
- [ ] Session key 必须 fund gas
- [ ] selector 提取严格 length check
- [ ] x402 native fallback 单独实现
- [ ] 周期配额一律 lazy reset
- [ ] viem 类型对不上时 `(client as any)` 先 ship
- [ ] macOS sed -i 加空字符串
- [ ] 防重放 set 留 TODO 改 Redis
- [ ] ABI 用 readFileSync + fileURLToPath
- [ ] 简化假设（如 "最后一个就是 active"）写注释 + 标 TODO

---

## 12. 关键复用引用清单

> 下次写类似项目时，回到这些位置 copy。

| 主题 | 路径 | 行号 |
|---|---|---|
| Session Key struct (8 维压缩) | `contracts/src/AgentVault.sol` | 13-22 |
| 9 步 execute 检查 | `contracts/src/AgentVault.sol` | 217-277 |
| `_extractSpendAmount` 算法 | `contracts/src/AgentVault.sol` | 331-347 |
| 每日 lazy reset | `contracts/src/AgentVault.sol` | 254-259, 313-321 |
| Native vs Token-locked 二选一 | `contracts/src/AgentVault.sol` | 236-244 |
| AES-256-GCM keystore | `packages/sdk/src/wallet.ts` | 71-110 |
| Session Key auto-fund + sleep 2s | `packages/sdk/src/session-key.ts` | 31-86 |
| TransactionBuilder 双路径 | `packages/sdk/src/transaction.ts` | 26-92 |
| Policy 三态决策 | `packages/sdk/src/policy-engine.ts` | 36-129 |
| SQLite audit schema | `packages/sdk/src/audit.ts` | 21-48 |
| getSpendingSummary 聚合 | `packages/sdk/src/audit.ts` | 127-175 |
| x402 probe + native fallback | `packages/sdk/src/x402-client.ts` | 60-179 |
| x402 probe (read-only) | `packages/sdk/src/x402-client.ts` | 187-223 |
| Paywall middleware | `packages/merchant-server/src/middleware/paywall.ts` | 全文 |
| 防重放 + 三路验证 | `packages/merchant-server/src/core/payment-verifier.ts` | 46-99 |
| 链上 verifyOnChain | `packages/merchant-server/src/core/payment-verifier.ts` | 150-193 |
| PriceEngine YAML + `*` 通配 | `packages/merchant-server/src/core/price-engine.ts` | 16-78 |
| Rate limiter | `packages/merchant-server/src/middleware/rate-limiter.ts` | 全文 |
| MCP confirmed 二次确认 | `packages/mcp-server/src/tools/payment.ts` | 74-81 |
| ServerState 单例 | `packages/mcp-server/src/index.ts` | 21-51 |
| MCP tool 命名学 + 输出格式 | `packages/mcp-server/src/tools/session.ts` | 全文 |
| Stripe design tokens | `DESIGN.md` | 全文 |
| 三段式风险分区 | `docs/场景设计.md` | 全文 |
| 一键部署脚本 | `scripts/deploy.sh` | 全文 |
| Agent-README 注释块 | `README.md` | 3-54 |
| Forge 测试套路 | `contracts/test/AgentVault.t.sol` | 全文 |

---

## 附录 A：环境变量速查

| Key | 必填 | 说明 |
|---|---|---|
| `OWNER_PRIVATE_KEY` | ✅ | 用户主钱包（hex with 0x） |
| `AGENTVAULT_ADDRESS` | ✅ | 合约地址（deploy.sh 自动填） |
| `MONAD_RPC_URL` | ⬜ | 默认 `https://testnet-rpc.monad.xyz` |
| `AGENT_VAULT_AGENT_ID` | ⬜ | 审计日志的 agent 标识，默认 `unknown` |
| `MERCHANT_PORT` | ⬜ | 商家服务端口，默认 4020 |
| `MERCHANT_WALLET_PRIVATE_KEY` | ⬜ | 商家钱包，默认与 OWNER 同 |
| `KEYSTORE_PASSWORD` | ⬜ | 本地 keystore AES-GCM 密码 |
| `NEXT_PUBLIC_VAULT_ADDRESS` | ⬜ | 前端用，与 AGENTVAULT_ADDRESS 同步 |

## 附录 B：Monad Testnet 速查

| | |
|---|---|
| Chain ID | 10143 |
| RPC | https://testnet-rpc.monad.xyz |
| Explorer | https://testnet.monadexplorer.com |
| 原生币 | MON (18 decimals) |
| Foundry 安装 | `curl -L https://foundry.category.xyz \| bash` 然后 `foundryup --network monad` |
| 测试 USDC | `0x534b2f3A21130d7a60830c2Df862319e593943A3` |
| 测试 WMON | `0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541` |

## 附录 C：MCP 工具速查（12 + 3）

**Tools (12)**：

| 工具 | 用途 |
|---|---|
| `setup_wallet` | 初始化 / 导入钱包 + 部署合约 |
| `get_balance` | 查 MON + USDC 余额 |
| `create_session` | 创建受限 Session Key |
| `revoke_session` | 撤销 Session Key |
| `list_sessions` | 列出所有 Session Key |
| `make_payment` | 策略检查 + 链上支付 + 审计 |
| `pay_for_api` | x402 付费 API 调用 |
| `get_policy` | 查看策略 |
| `update_policy` | 修改策略 |
| `get_history` | 查询审计日志 |
| `get_spending_summary` | 消费统计 |
| `emergency_pause` | 紧急暂停 / 恢复 |

**Resources (3)**：
- `agentvault://wallet/state` — 钱包状态
- `agentvault://policy/current` — 当前策略
- `agentvault://audit/recent` — 最近审计

---

**END.** 下次黑客松开工时，从第 1 章顺序读到第 11 章，再扫一遍第 12 章引用清单，2 小时内能完成认知冷启动。
