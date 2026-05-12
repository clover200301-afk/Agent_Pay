// 中英双语字典。新增文案时同时更新 en + zh 两份。
// key 约定：组件路径.语义（点号分层），便于在大量组件中追溯出处。

// Helper type: deep-string variant of the literal dictionary, so that zh.ts
// can re-implement the same shape without inheriting literal string types.
type Stringify<T> = {
  [K in keyof T]: T[K] extends string ? string : Stringify<T[K]>;
};

const dict = {
  common: {
    connectWallet: "Connect Wallet",
    launchApp: "Launch app",
    startAgent: "Start Agent",
    viewDemo: "View Demo",
    signIn: "Sign in",
    approve: "Approve",
    reject: "Reject",
    copy: "Copy",
    copied: "Copied",
    network: "Network",
    monadTestnet: "Monad Testnet",
    live: "live",
    demoMode: "Hackathon demo",
  },

  nav: {
    howItWorks: "How it works",
    whyMonad: "Why Monad",
    demo: "Demo",
  },

  hero: {
    badge: "Live on Monad Testnet",
    titleLine1: "AI Agents",
    titleLine2: "That Can Pay.",
    subtitle:
      "Autonomous AI agents that discover, compare, and purchase digital services using Monad — so your agent can actually finish the job, not just plan it.",
    bullet1: "Non-custodial",
    bullet2: "Sub-second finality",
    bullet3: "Microtransaction-ready",
  },

  preview: {
    task: "Task",
    taskExample: "Buy the cheapest image generation API under 5 USDC.",
    steps: {
      understanding: "Understanding task",
      searching: "Searching providers",
      comparing: "Comparing prices",
      selecting: "Selecting provider",
      awaiting: "Awaiting approval",
    },
    approveQuestion: "Approve 3.2 USDC payment to VisionAPI?",
  },

  howItWorks: {
    eyebrow: "How it works",
    title: "From prompt to payment, with a human in the loop.",
    step: "Step",
    s1Title: "Describe the task",
    s1Body:
      "Tell your agent what you need — “Buy the cheapest image API under 5 USDC.” Natural language, no SDKs.",
    s2Title: "Agent reasons & shops",
    s2Body:
      "The agent searches providers, compares pricing and reliability, and proposes the best fit in seconds.",
    s3Title: "You approve, Monad settles",
    s3Body:
      "One signature settles the payment on Monad. The agent receives credentials and gets to work.",
  },

  whyMonad: {
    eyebrow: "Why Monad",
    title: "Built for machine-to-machine commerce.",
    subtitle:
      "Agents transact in tight loops — they need confirmation latency that feels like an API call and gas that doesn’t eat the margin.",
    tps: "TPS",
    tpsNote: "High-frequency agent payments",
    finality: "Finality",
    finalityNote: "Real-time autonomous flows",
    gas: "Gas",
    gasNote: "Microtransactions are viable",
    compat: "Compat",
    compatNote: "Drop-in for existing tooling",
  },

  demoPreview: {
    eyebrow: "Demo preview",
    title: "One workspace. Streaming agent. On-chain settle.",
    history1: "Buy cheapest image API",
    history2: "Renew GPT subscription",
    history3: "Find translator <5 USDC",
    taskLabel: "Task",
    taskValue: "Buy the cheapest image generation API under 5 USDC",
    approval: "Approval",
    serviceName: "VisionAPI Pro",
    price: "Price",
    approvePayment: "Approve Payment",
  },

  cta: {
    titleLine1: "Give your agent",
    titleLine2: "a way to pay.",
    body:
      "Spin up the demo in 30 seconds. No marketplaces to configure, no APIs to wire — just a prompt, a signature, and a settled Monad transaction.",
    readMore: "Read more",
    footerTagline: "AI-native payment infrastructure on Monad.",
  },

  login: {
    readOverviewPrefix: "New to AgentPay?",
    readOverview: "Read the overview",
    welcomeBack: "Welcome back",
    title: "Sign in to AgentPay",
    subtitle:
      "Email and password are placeholders for the demo. Use Connect Wallet for the real Monad flow.",
    email: "Email",
    password: "Password",
    or: "or",
    continueGuest: "Continue as guest",
    connectedPrefix: "Connected —",
    disclaimer:
      "By continuing you agree to operate in non-custodial demo mode.",
    rightEyebrow: "Agent in action",
    rightTitle: "Watch the workflow",
    rightBody:
      "A live preview of what your agent will do once it’s in the workspace.",
  },

  sidebar: {
    history: "History",
    historyEmpty:
      "No tasks yet. Try one of the example prompts to start.",
    wallet: "Wallet",
    balance: "Balance",
    newTask: "New task",
    walletPrompt:
      "Connect a wallet to settle on Monad. Demo mode works without one.",
    timeJustNow: "just now",
    timeMinutesAgo: "m ago",
    timeHoursAgo: "h ago",
    timeDaysAgo: "d ago",
  },

  dashboard: {
    workspace: "Workspace",
    runtime: "Agent runtime",
    payment: "Payment",
    paymentSubtitle: "Approval & settlement",
    noApproval: "No pending approval",
    noApprovalBody:
      "Submit a task on the left. The agent will surface a payment request here.",
    startEyebrow: "Start",
    startTitleLine1: "What would you like",
    startTitleLine2: "your agent to do?",
    startSubtitle:
      "Describe a service to buy. The agent will search, compare, and prepare a payment for your approval.",
    newTask: "New task",
    messages: "Messages",
    settings: "Settings",
    apiList: "API list",
  },

  chat: {
    placeholder: "What would you like your agent to do?",
    examples: {
      cheapestImage: "Buy the cheapest image generation API under 5 USDC",
      gptCredits: "Purchase GPT API credits for the next 30 days",
      translation: "Find a translation API with sub-200ms latency",
      renewSub: "Renew my AI tool subscription if price < 12 USDC",
    },
  },

  workflow: {
    eyebrow: "Agent workflow",
    state: {
      running: "Running",
      awaiting: "Awaiting approval",
      paying: "Settling",
      success: "Completed",
      rejected: "Rejected",
      idle: "Idle",
    },
    steps: {
      understanding: { title: "Understanding request", detail: "Parsing intent and constraints" },
      searching: { title: "Searching providers", detail: "Querying agent marketplace" },
      comparing: { title: "Comparing pricing", detail: "Ranking by USDC unit cost" },
      evaluating: { title: "Evaluating reliability", detail: "Cross-checking uptime & ratings" },
      selecting: { title: "Selecting provider", detail: "Choosing optimal candidate" },
      preparing: { title: "Preparing transaction", detail: "Building Monad calldata" },
      awaiting_approval: { title: "Awaiting approval", detail: "Requires human signature" },
    },
  },

  providers: {
    eyebrow: "Providers",
    sortedByPrice: "Sorted by price",
    selected: "Selected",
    uptime: "Uptime",
    badgeTopRated: "Top rated",
    visionTagline: "High-fidelity image generation",
    forgeTagline: "Fast, low-cost diffusion",
    pixelTagline: "Premium photoreal output",
  },

  payment: {
    eyebrow: "Approval",
    title: "Agent requests payment",
    service: "Service",
    price: "Price",
    network: "Network",
    gasFee: "Gas fee",
    settlesIn: "Settles in",
    confirming: "Confirming…",
    approveBtn: "Approve Payment",
    rejectBtn: "Reject",
    disclaimer: "You sign once. The agent settles, then receives the API key.",
  },

  tx: {
    eyebrow: "Transaction",
    statusSuccess: "Confirmed",
    statusConfirming: "Confirming on Monad",
    statusPending: "Submitting",
    badgeSuccess: "Success",
    badgePending: "Pending",
    network: "Network",
    txHash: "Tx hash",
    apiKeyTitle: "API key generated",
    apiKeyHint: "Store this securely — VisionAPI accepts it as a bearer token.",
    txConfirmedToast: "Transaction confirmed",
    apiKeyToast: "API key generated and ready to use.",
    paymentFailedToast: "Payment failed",
    addressCopied: "Address copied",
    apiKeyCopied: "API key copied",
    txHashCopied: "Tx hash copied",
  },

  language: {
    en: "EN",
    zh: "中",
    label: "Language",
  },

  auth: {
    signInWithGoogle: "Continue with Google",
    signInWithApple: "Continue with Apple",
    oauthDisabledHint:
      "Set the matching OAuth client env vars to enable this provider.",
    signOut: "Sign out",
    signedInAs: "Signed in as",
    providerCredentials: "Email",
    providerGoogle: "Google",
    providerApple: "Apple",
  },

  gate: {
    bannerEyebrow: "Setup required",
    bannerTitle: "Configure a model API key to start",
    bannerBody:
      "The agent needs at least one base model (OpenAI / Google / Anthropic / Doubao / Qwen / DeepSeek) to reason and shop on your behalf.",
    cta: "Open settings",
    chatPlaceholderDisabled:
      "Configure a model in Settings before sending a task.",
  },

  settings: {
    title: "Settings",
    subtitle: "Configure the models, account, and notifications.",
    sectionModels: "Base reasoning models",
    sectionModelsHint:
      "Add at least one key. The agent picks the cheapest configured model by default — switch the default any time.",
    sectionAccount: "Account",
    sectionNotifications: "Notifications",
    sectionExport: "Data export",
    comingSoon: "Coming soon",
    saveBtn: "Save",
    savedBadge: "Configured",
    notConfigured: "Not configured",
    getKeyLink: "Get API key",
    docsLink: "Docs",
    keyHidden: "Show",
    keyShown: "Hide",
    keySavedToast: "Saved",
    keyRemoved: "Removed",
    removeBtn: "Remove",
    backToDashboard: "Back to workspace",
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
      name: "Doubao",
      tagline: "ByteDance · Doubao Pro & Lite",
    },
    qwen: {
      name: "Qwen",
      tagline: "Alibaba · Qwen-Max · Qwen-Plus",
    },
    deepseek: {
      name: "DeepSeek",
      tagline: "DeepSeek-V3 · DeepSeek-R1",
    },
  },

  taskReview: {
    eyebrow: "Task review",
    headerPrompt: "Prompt",
    status: "Status",
    completedAt: "Completed",
    selectedProvider: "Selected provider",
    timelineTitle: "Agent workflow",
    chatTitle: "Conversation",
    chatPlaceholder:
      "Once a real model is connected, the full conversation with the agent will appear here.",
    backToWorkspace: "Back to workspace",
    notFoundTitle: "Task no longer available",
    notFoundBody: "Start a new task to continue.",
  },

  apiKeys: {
    title: "API keys",
    subtitle: "Credentials issued by completed agent payments.",
    emptyTitle: "No API keys yet",
    emptyBody:
      "Once the agent completes a payment on Monad, the issued key will appear here.",
    runFirstTask: "Run your first task",
    colProvider: "Provider",
    colPrice: "Price",
    colKey: "Key",
    colTxHash: "Tx hash",
    colCreatedAt: "Issued",
    delete: "Remove",
    removed: "API key removed",
  },

  messages: {
    title: "Messages",
    subtitle: "Agent notifications and payment receipts.",
    emptyTitle: "No messages yet",
    emptyBody:
      "When the agent finishes a task or needs your attention, you'll see it here.",
  },
} as const;

export type Dict = Stringify<typeof dict>;
export const en: Dict = dict;
