import type { Dict } from "./en";

export const zh: Dict = {
  common: {
    connectWallet: "连接钱包",
    launchApp: "进入应用",
    startAgent: "启动 Agent",
    viewDemo: "观看演示",
    signIn: "登录",
    approve: "授权",
    reject: "拒绝",
    copy: "复制",
    copied: "已复制",
    network: "网络",
    monadTestnet: "Monad 测试网",
    live: "在线",
    demoMode: "黑客松 Demo",
  },

  nav: {
    howItWorks: "工作原理",
    whyMonad: "为何选 Monad",
    demo: "演示",
  },

  hero: {
    badge: "Monad 测试网已上线",
    titleLine1: "会支付的",
    titleLine2: "AI Agent。",
    subtitle:
      "自主 AI Agent 通过 Monad 发现、比较并购买数字服务——让 Agent 真正完成任务，而不只是写计划。",
    bullet1: "非托管",
    bullet2: "亚秒级最终性",
    bullet3: "支持微支付",
  },

  preview: {
    task: "任务",
    taskExample: "用 5 USDC 以内最便宜的价格买一个图像生成 API。",
    steps: {
      understanding: "理解任务",
      searching: "搜索服务商",
      comparing: "比较价格",
      selecting: "选择服务商",
      awaiting: "等待授权",
    },
    approveQuestion: "向 VisionAPI 支付 3.2 USDC？",
  },

  howItWorks: {
    eyebrow: "工作原理",
    title: "从 Prompt 到支付，人始终在回路中。",
    step: "第",
    s1Title: "描述任务",
    s1Body:
      "用自然语言告诉 Agent 你的需求 ——「用 5 USDC 以内的价格买一个图像 API」。无需 SDK。",
    s2Title: "Agent 推理与比价",
    s2Body:
      "Agent 自动搜索服务商、比较价格与可靠性，几秒内推荐最优方案。",
    s3Title: "你授权，Monad 结算",
    s3Body:
      "一次签名即可在 Monad 上完成结算。Agent 拿到凭证开始工作。",
  },

  whyMonad: {
    eyebrow: "为何选 Monad",
    title: "为机器之间的商业而生。",
    subtitle:
      "Agent 在紧密循环中交易——它们需要像 API 调用一样快的确认延迟，以及不会吃掉利润的 Gas。",
    tps: "TPS",
    tpsNote: "高频 Agent 支付",
    finality: "最终性",
    finalityNote: "实时自主流程",
    gas: "Gas",
    gasNote: "微支付变得可行",
    compat: "兼容性",
    compatNote: "无缝接入现有工具链",
  },

  demoPreview: {
    eyebrow: "Demo 预览",
    title: "一个工作台。流式 Agent。链上结算。",
    history1: "买最便宜的图像 API",
    history2: "续订 GPT 订阅",
    history3: "找 5 USDC 以内的翻译 API",
    taskLabel: "任务",
    taskValue: "用 5 USDC 以内的价格买一个图像生成 API",
    approval: "授权",
    serviceName: "VisionAPI Pro",
    price: "价格",
    approvePayment: "授权支付",
  },

  cta: {
    titleLine1: "给你的 Agent",
    titleLine2: "一种支付方式。",
    body:
      "30 秒启动 Demo。无需配置市场、无需对接 API ——只要一句 Prompt、一次签名，就能完成 Monad 链上交易。",
    readMore: "了解更多",
    footerTagline: "运行在 Monad 上的 AI 原生支付基础设施。",
  },

  login: {
    readOverviewPrefix: "第一次使用 AgentPay？",
    readOverview: "查看产品介绍",
    welcomeBack: "欢迎回来",
    title: "登录 AgentPay",
    subtitle:
      "邮箱与密码仅作 Demo 占位。如需体验真实 Monad 流程，请使用「连接钱包」。",
    email: "邮箱",
    password: "密码",
    or: "或",
    continueGuest: "以访客身份继续",
    connectedPrefix: "已连接 ——",
    disclaimer: "继续即表示你同意以非托管 Demo 模式运行。",
    rightEyebrow: "Agent 实时演示",
    rightTitle: "观看完整工作流",
    rightBody:
      "Agent 进入工作台后所做事情的实时预览。",
  },

  sidebar: {
    history: "历史",
    historyEmpty: "暂无任务。可以从下方示例 Prompt 开始体验。",
    wallet: "钱包",
    balance: "余额",
    newTask: "新建任务",
    walletPrompt:
      "连接钱包以在 Monad 上结算。Demo 模式无需钱包也能体验。",
    timeJustNow: "刚刚",
    timeMinutesAgo: " 分钟前",
    timeHoursAgo: " 小时前",
    timeDaysAgo: " 天前",
  },

  dashboard: {
    workspace: "工作台",
    runtime: "Agent 运行时",
    payment: "支付",
    paymentSubtitle: "授权与结算",
    noApproval: "暂无待授权请求",
    noApprovalBody:
      "在左侧提交任务后，Agent 会在这里发起支付请求。",
    startEyebrow: "开始",
    startTitleLine1: "你希望让 Agent",
    startTitleLine2: "做什么？",
    startSubtitle:
      "描述你想购买的服务。Agent 会自动搜索、比价、并准备好支付请求等待你授权。",
    newTask: "新任务",
    messages: "消息",
    settings: "设置",
    apiList: "API 列表",
  },

  chat: {
    placeholder: "你希望 Agent 做什么？",
    examples: {
      cheapestImage: "用 5 USDC 以内的价格买最便宜的图像生成 API",
      gptCredits: "购买未来 30 天的 GPT API 额度",
      translation: "找一个延迟低于 200ms 的翻译 API",
      renewSub: "如果价格低于 12 USDC 就续订我的 AI 工具",
    },
  },

  workflow: {
    eyebrow: "Agent 工作流",
    state: {
      running: "运行中",
      awaiting: "等待授权",
      paying: "结算中",
      success: "已完成",
      rejected: "已拒绝",
      idle: "空闲",
    },
    steps: {
      understanding: { title: "理解请求", detail: "解析意图与约束条件" },
      searching: { title: "搜索服务商", detail: "查询 Agent 市场" },
      comparing: { title: "比较价格", detail: "按 USDC 单价排序" },
      evaluating: { title: "评估可靠性", detail: "交叉验证可用性与评分" },
      selecting: { title: "选择服务商", detail: "选定最优候选" },
      preparing: { title: "准备交易", detail: "构造 Monad calldata" },
      awaiting_approval: { title: "等待授权", detail: "需要人工签名" },
    },
  },

  providers: {
    eyebrow: "服务商",
    sortedByPrice: "按价格排序",
    selected: "已选定",
    uptime: "可用性",
    badgeTopRated: "高评分",
    visionTagline: "高保真图像生成",
    forgeTagline: "快速、低成本扩散模型",
    pixelTagline: "极致写实输出",
  },

  payment: {
    eyebrow: "授权",
    title: "Agent 请求支付",
    service: "服务",
    price: "价格",
    network: "网络",
    gasFee: "Gas 费",
    settlesIn: "结算时间",
    confirming: "确认中…",
    approveBtn: "授权支付",
    rejectBtn: "拒绝",
    disclaimer: "你只需签名一次。Agent 完成结算后即可获得 API key。",
  },

  tx: {
    eyebrow: "交易",
    statusSuccess: "已确认",
    statusConfirming: "Monad 确认中",
    statusPending: "提交中",
    badgeSuccess: "成功",
    badgePending: "处理中",
    network: "网络",
    txHash: "交易哈希",
    apiKeyTitle: "API key 已生成",
    apiKeyHint: "请妥善保管 ——VisionAPI 接受此 key 作为 Bearer Token。",
    txConfirmedToast: "交易已确认",
    apiKeyToast: "API key 已生成，可以使用了。",
    paymentFailedToast: "支付失败",
    addressCopied: "地址已复制",
    apiKeyCopied: "API key 已复制",
    txHashCopied: "交易哈希已复制",
  },

  language: {
    en: "EN",
    zh: "中",
    label: "语言",
  },

  auth: {
    signInWithGoogle: "使用 Google 继续",
    signInWithApple: "使用 Apple 继续",
    oauthDisabledHint:
      "请在环境变量中配置对应的 OAuth Client ID 与 Secret 后启用。",
    signOut: "退出登录",
    signedInAs: "当前账号",
    providerCredentials: "邮箱",
    providerGoogle: "Google",
    providerApple: "Apple",
  },

  gate: {
    bannerEyebrow: "需要先完成配置",
    bannerTitle: "请先配置一个模型 API key",
    bannerBody:
      "Agent 需要至少一个基础模型（OpenAI / Google / Anthropic / Doubao / Qwen / DeepSeek）才能进行推理和比价。",
    cta: "打开设置",
    chatPlaceholderDisabled: "请先在设置中配置至少一个模型 API key。",
  },

  settings: {
    title: "设置",
    subtitle: "管理模型、账户与通知偏好。",
    sectionModels: "基础对话与推理模型",
    sectionModelsHint:
      "至少配置一个 API key。Agent 会默认使用已配置中价格最低的模型，可随时切换默认。",
    sectionAccount: "账户",
    sectionNotifications: "通知",
    sectionExport: "数据导出",
    comingSoon: "敬请期待",
    saveBtn: "保存",
    savedBadge: "已配置",
    notConfigured: "未配置",
    getKeyLink: "申请 API key",
    docsLink: "查看文档",
    keyHidden: "显示",
    keyShown: "隐藏",
    keySavedToast: "已保存",
    keyRemoved: "已移除",
    removeBtn: "移除",
    backToDashboard: "返回工作台",
  },

  models: {
    openai: {
      name: "OpenAI",
      tagline: "GPT-4o · GPT-4o-mini · o1",
    },
    google: {
      name: "Google",
      tagline: "Gemini 2.0 Flash · Pro",
    },
    anthropic: {
      name: "Anthropic",
      tagline: "Claude Opus 4.7 · Sonnet 4.6 · Haiku 4.5",
    },
    doubao: {
      name: "豆包",
      tagline: "字节跳动 · Doubao Pro 与 Lite",
    },
    qwen: {
      name: "通义千问",
      tagline: "阿里巴巴 · Qwen-Max · Qwen-Plus",
    },
    deepseek: {
      name: "DeepSeek",
      tagline: "DeepSeek-V3 · DeepSeek-R1",
    },
  },

  taskReview: {
    eyebrow: "任务回顾",
    headerPrompt: "Prompt",
    status: "状态",
    completedAt: "完成于",
    selectedProvider: "选中的服务商",
    timelineTitle: "Agent 工作流",
    chatTitle: "对话记录",
    chatPlaceholder: "接入真实模型 API 后，此处会显示与 Agent 的完整对话记录。",
    backToWorkspace: "返回工作台",
    notFoundTitle: "任务记录已失效",
    notFoundBody: "请创建一个新任务。",
  },

  apiKeys: {
    title: "API key 列表",
    subtitle: "Agent 完成支付后颁发给你的所有凭证。",
    emptyTitle: "暂无 API key",
    emptyBody: "完成一次 Monad 支付后，Agent 颁发的 key 会展示在这里。",
    runFirstTask: "去发起第一个任务",
    colProvider: "服务商",
    colPrice: "价格",
    colKey: "API Key",
    colTxHash: "交易哈希",
    colCreatedAt: "时间",
    delete: "移除",
    removed: "已移除该 key",
  },

  messages: {
    title: "消息",
    subtitle: "Agent 通知与支付回执。",
    emptyTitle: "暂无消息",
    emptyBody: "Agent 完成任务或需要你处理时，相关通知会出现在这里。",
  },
};
