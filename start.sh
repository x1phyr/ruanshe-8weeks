#!/usr/bin/env bash
# ==============================================================================
# 软考软件设计师 8周通关与极限冲刺备考系统 一键启动脚本
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "======================================================="
echo "  软考中级软件设计师 · 8周备考与极限冲刺系统"
echo "======================================================="
echo ""

# 1. Check Node.js and npm
if ! command -v node >/dev/null 2>&1; then
  echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js (推荐 v18+ 或 v20+)。"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ 错误: 未检测到 npm，请先安装 npm。"
  exit 1
fi

NODE_VER=$(node -v)
NPM_VER=$(npm -v)
echo "✓ Node.js 版本: $NODE_VER"
echo "✓ npm 版本:     $NPM_VER"

# 2. Check dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 未检测到 node_modules，正在执行 npm install..."
  npm install
else
  echo "✓ 依赖项就绪 (node_modules 已存在)"
fi

# 3. Handle arguments
MODE="prod"
PORT="${PORT:-43180}"

for arg in "$@"; do
  case "$arg" in
    --dev)
      MODE="dev"
      ;;
    --build)
      echo "🔨 执行生产编译..."
      npm run build
      echo "✓ 编译完成！"
      exit 0
      ;;
    *)
      ;;
  esac
done

# 4. Launch
if [ "$MODE" = "dev" ]; then
  echo "🚀 启动 Next.js 极速热重载开发服务器 (Port: $PORT)..."
  PORT="$PORT" npm run dev
else
  # Production Mode: Ensure out/ exists and is up to date
  if [ ! -d "out" ] || [ ! -f "out/index.html" ]; then
    echo "🔨 正在执行 Next.js 生产构建与静态导出..."
    npm run build
  else
    echo "✓ 生产构建产物就绪 (out/)"
  fi

  echo "🚀 启动本地高性能服务 (Port: $PORT)..."
  PORT="$PORT" node scripts/serve.mjs
fi
