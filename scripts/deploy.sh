#!/usr/bin/env bash
# Deploy AgentPay.sol to Monad Testnet, capture the address, and write it
# back into .env.local so the Next.js app picks it up automatically.
#
# Usage: OWNER_PRIVATE_KEY=0x... ./scripts/deploy.sh
#
# Requires Foundry (`foundryup --network monad`).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

# Load .env.local if present (so OWNER_PRIVATE_KEY can live there)
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

if [ -z "${OWNER_PRIVATE_KEY:-}" ]; then
  echo "✗ OWNER_PRIVATE_KEY is not set. Add it to .env.local or export it." >&2
  exit 1
fi

RPC="${NEXT_PUBLIC_RPC_URL:-https://testnet-rpc.monad.xyz}"

echo "▶ Building contracts..."
( cd "$ROOT/contracts" && forge build --silent )

echo "▶ Deploying to $RPC ..."
DEPLOY_OUTPUT=$(
  cd "$ROOT/contracts" && \
  forge script script/Deploy.s.sol:DeployAgentPay \
    --rpc-url "$RPC" \
    --broadcast \
    --silent 2>&1
)

CONTRACT=$(echo "$DEPLOY_OUTPUT" | grep "AgentPay deployed at:" | awk '{print $NF}' | tail -1)

if [ -z "$CONTRACT" ]; then
  echo "$DEPLOY_OUTPUT" >&2
  echo "✗ Could not parse contract address from deploy output." >&2
  exit 1
fi

# Ensure .env.local exists and update / append the address (macOS sed requires '')
touch "$ENV_FILE"
if grep -q "^NEXT_PUBLIC_AGENTPAY_ADDRESS=" "$ENV_FILE"; then
  sed -i '' "s|^NEXT_PUBLIC_AGENTPAY_ADDRESS=.*|NEXT_PUBLIC_AGENTPAY_ADDRESS=$CONTRACT|" "$ENV_FILE"
else
  echo "NEXT_PUBLIC_AGENTPAY_ADDRESS=$CONTRACT" >> "$ENV_FILE"
fi

echo
echo "✓ AgentPay deployed: $CONTRACT"
echo "  Explorer: https://testnet.monadexplorer.com/address/$CONTRACT"
echo "  Wrote NEXT_PUBLIC_AGENTPAY_ADDRESS to $ENV_FILE"
