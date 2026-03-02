#!/bin/bash

# kk哥的个人博客启动脚本

echo "🚀 启动kk哥的个人博客服务器..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：Node.js未安装"
    echo "请先安装Node.js："
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：npm未安装"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务器
echo "🌐 服务器启动中..."
echo "本地访问：http://localhost:3000"
echo "公网访问：http://101.37.105.81:3000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

node server.js