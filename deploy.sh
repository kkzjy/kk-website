#!/bin/bash

# kk哥的个人博客部署脚本

echo "🚀 开始部署kk哥的个人博客..."

# 检查是否在正确的目录
if [ ! -f "server.js" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：Node.js未安装"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：npm未安装"
    exit 1
fi

# 检查是否安装了PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  警告：PM2未安装，将使用npm启动"
    echo "   如果需要进程管理，请安装PM2：npm install -g pm2"
    USE_PM2=false
else
    USE_PM2=true
fi

# 检查是否有更新
echo "📦 检查更新..."
git pull origin master

# 安装依赖
echo "📦 安装依赖..."
npm install

# 如果使用PM2
if [ "$USE_PM2" = true ]; then
    # 检查是否已有PM2进程
    if pm2 list | grep -q "kk-website"; then
        echo "🔄 重启PM2进程..."
        pm2 restart kk-website
    else
        echo "🚀 启动PM2进程..."
        pm2 start server.js --name kk-website
        pm2 save
        pm2 startup
    fi
    
    echo "✅ 部署完成！"
    echo "📊 查看日志：pm2 logs kk-website"
    echo "🌐 访问地址：http://localhost:3000"
else
    # 使用npm启动
    echo "🔄 停止旧进程..."
    pkill -f "node server.js" 2>/dev/null || true
    
    echo "🚀 启动服务器..."
    nohup node server.js > /tmp/kk-website.log 2>&1 &
    
    echo "✅ 部署完成！"
    echo "📊 查看日志：tail -f /tmp/kk-website.log"
    echo "🌐 访问地址：http://localhost:3000"
fi

echo ""
echo "📝 提示："
echo "   - 如果需要修改代码，请先提交到Git仓库"
echo "   - 然后在服务器上运行此脚本"
echo "   - 或者直接在服务器上拉取更新并重启"