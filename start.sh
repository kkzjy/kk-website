#!/bin/bash

# kk哥个人主页启动脚本

echo "🚀 启动kk哥的个人主页..."
cd /root/.openclaw/workspace/kk-website

# 检查是否有进程在运行
if pgrep -f "node server.js" > /dev/null; then
    echo "⚠️  发现已有进程在运行，正在停止..."
    pkill -f "node server.js"
    sleep 2
fi

# 启动服务
nohup node server.js > /tmp/kk-website.log 2>&1 &

echo "✅ 个人主页已启动"
echo "📍 访问地址: http://localhost:3000"
echo "🌐 公网访问: http://101.37.105.81:3000"
echo "📋 日志文件: /tmp/kk-website.log"
echo ""
echo "查看日志: tail -f /tmp/kk-website.log"
echo "停止服务: pkill -f 'node server.js'"